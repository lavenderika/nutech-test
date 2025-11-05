const db = require('../config/database');

const getBalance = async (req, res) => {
	let connection = null;
	try {
		const email = req.user && req.user.email;
		if (!email) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}

		connection = await db.getConnection();

		// find user id by email
		const [users] = await connection.execute(
			'SELECT id FROM users WHERE email = ? LIMIT 1',
			[email]
		);
		if (users.length === 0) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}
		const userId = users[0].id;

		// get balance by user id
		const [balances] = await connection.execute(
			'SELECT balance FROM balances WHERE user_id = ? LIMIT 1',
			[userId]
		);
		const balance = balances.length > 0 ? Number(balances[0].balance) : 0;

		return res.status(200).json({
			status: 0,
			message: 'Get Balance Berhasil',
			data: { balance }
		});
	} catch (error) {
		console.error('Get balance error:', error);
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
			data: null
		});
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

const topUp = async (req, res) => {
	let connection = null;
	try {
		const email = req.user && req.user.email;
		if (!email) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}

		// validate amount
		const { top_up_amount } = req.body;
		const amount = Number(top_up_amount);
		if (
			top_up_amount === undefined ||
			top_up_amount === null ||
			Number.isNaN(amount) ||
			!Number.isFinite(amount) ||
			amount < 0
		) {
			return res.status(400).json({
				status: 102,
				message: 'Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0',
				data: null
			});
		}

		connection = await db.getConnection();
		await connection.beginTransaction();

		// get user id
		const [users] = await connection.execute(
			'SELECT id FROM users WHERE email = ? LIMIT 1',
			[email]
		);
		if (users.length === 0) {
			await connection.rollback();
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}
		const userId = users[0].id;

		// update balance (add amount)
		await connection.execute(
			'UPDATE balances SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
			[amount, userId]
		);

		// insert transaction record
		await connection.execute(
			"INSERT INTO transactions (user_id, transaction_type, amount, service_code, service_name, description) VALUES (?, 'TOPUP', ?, NULL, NULL, ?)",
			[userId, amount, 'Top up saldo']
		);

		// read new balance
		const [balances] = await connection.execute(
			'SELECT balance FROM balances WHERE user_id = ? LIMIT 1',
			[userId]
		);
		const newBalance = balances.length > 0 ? Number(balances[0].balance) : 0;

		await connection.commit();

		return res.status(200).json({
			status: 0,
			message: 'Top Up Balance Berhasil',
			data: { balance: newBalance }
		});
	} catch (error) {
		if (connection) {
			await connection.rollback();
		}
		console.error('Top up error:', error);
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
			data: null
		});
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

const createPayment = async (req, res) => {
	let connection = null;
	try {
		const email = req.user && req.user.email;
		if (!email) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}

		const { service_code } = req.body;
		if (!service_code) {
			return res.status(400).json({
				status: 102,
				message: 'Service atau Layanan tidak ditemukan',
				data: null
			});
		}

		connection = await db.getConnection();
		await connection.beginTransaction();

		// resolve user id
		const [users] = await connection.execute(
			'SELECT id FROM users WHERE email = ? LIMIT 1',
			[email]
		);
		if (users.length === 0) {
			await connection.rollback();
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}
		const userId = users[0].id;

		// find service
		const [services] = await connection.execute(
			'SELECT service_code, service_name, service_icon, service_tariff FROM services WHERE service_code = ? AND is_active = 1 LIMIT 1',
			[service_code]
		);
		if (services.length === 0) {
			await connection.rollback();
			return res.status(400).json({
				status: 102,
				message: 'Service atau Layanan tidak ditemukan',
				data: null
			});
		}
		const service = services[0];
		const amount = Number(service.service_tariff);

		// lock balance row and check sufficient funds
		const [balanceRows] = await connection.execute(
			'SELECT balance FROM balances WHERE user_id = ? LIMIT 1 FOR UPDATE',
			[userId]
		);
		const currentBalance = balanceRows.length > 0 ? Number(balanceRows[0].balance) : 0;
		if (currentBalance < amount) {
			await connection.rollback();
			return res.status(400).json({
				status: 104,
				message: 'Saldo tidak cukup',
				data: null
			});
		}

		// deduct balance
		await connection.execute(
			'UPDATE balances SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
			[amount, userId]
		);

		// generate invoice number
		const now = new Date();
		const pad = (n) => (n < 10 ? '0' + n : '' + n);
		const invoice = `INV${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${Math.floor(100 + Math.random()*900)}`;

		// insert transaction record
		const description = `${service.service_name} payment`;
		await connection.execute(
			"INSERT INTO transactions (user_id, transaction_type, amount, service_code, service_name, description) VALUES (?, 'PAYMENT', ?, ?, ?, ?)",
			[userId, amount, service.service_code, service.service_name, description]
		);

		// commit
		await connection.commit();

		return res.status(200).json({
			status: 0,
			message: 'Transaksi berhasil',
			data: {
				invoice_number: invoice,
				service_code: service.service_code,
				service_name: service.service_name,
				transaction_type: 'PAYMENT',
				total_amount: amount,
				created_on: now.toISOString()
			}
		});
	} catch (error) {
		if (connection) {
			await connection.rollback();
		}
		console.error('Create payment error:', error);
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
			data: null
		});
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

const getHistory = async (req, res) => {
	let connection = null;
	try {
		const email = req.user && req.user.email;
		if (!email) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}

		// parse query params
		const offsetRaw = req.query.offset;
		const limitRaw = req.query.limit;
		const offset = offsetRaw !== undefined ? Math.max(0, parseInt(offsetRaw, 10) || 0) : 0;
		const hasLimit = limitRaw !== undefined;
		const limit = hasLimit ? Math.max(0, parseInt(limitRaw, 10) || 0) : 0;

		connection = await db.getConnection();

		// resolve user id
		const [users] = await connection.execute(
			'SELECT id FROM users WHERE email = ? LIMIT 1',
			[email]
		);
		if (users.length === 0) {
			return res.status(401).json({
				status: 108,
				message: 'Token tidak tidak valid atau kadaluwarsa',
				data: null
			});
		}
		const userId = users[0].id;

		// build query
		let query = `SELECT id, transaction_type, amount, description, created_at
			FROM transactions WHERE user_id = ?
			ORDER BY created_at DESC`;
		const params = [userId];
		if (hasLimit) {
			query += ' LIMIT ? OFFSET ?';
			params.push(limit, offset);
		}

		const [rows] = await connection.execute(query, params);

		// map to desired shape
		const records = rows.map((r) => {
			const created = new Date(r.created_at);
			const pad = (n) => (n < 10 ? '0' + n : '' + n);
			const invoice = `INV${created.getFullYear()}${pad(created.getMonth() + 1)}${pad(created.getDate())}${pad(created.getHours())}${pad(created.getMinutes())}${pad(created.getSeconds())}-${r.id}`;
			return {
				invoice_number: invoice,
				transaction_type: r.transaction_type,
				description: r.description,
				total_amount: Number(r.amount),
				created_on: created.toISOString(),
			};
		});

		return res.status(200).json({
			status: 0,
			message: 'Get History Berhasil',
			data: {
				offset: offset,
				limit: hasLimit ? limit : records.length,
				records: records,
			},
		});
	} catch (error) {
		console.error('Get history error:', error);
		return res.status(500).json({
			status: 500,
			message: 'Internal server error',
			data: null
		});
	} finally {
		if (connection) {
			connection.release();
		}
	}
};

module.exports = {
	getBalance,
	topUp,
	createPayment,
	getHistory,
};
