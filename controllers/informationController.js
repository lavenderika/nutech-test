const db = require('../config/database');

const getBanners = async (req, res) => {
	let connection = null;
	try {
		connection = await db.getConnection();
		const [rows] = await connection.execute(
			'SELECT banner_name, banner_image, description FROM banners WHERE is_active = 1 ORDER BY id ASC'
		);

		return res.status(200).json({
			status: 0,
			message: 'Sukses',
			data: rows
		});
	} catch (error) {
		console.error('Get banners error:', error);
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

const getServices = async (req, res) => {
	let connection = null;
	try {
		connection = await db.getConnection();
		const [rows] = await connection.execute(
			`SELECT service_code, service_name, service_icon, service_tariff
			 FROM services WHERE is_active = 1 ORDER BY id ASC`
		);

		return res.status(200).json({
			status: 0,
			message: 'Sukses',
			data: rows
		});
	} catch (error) {
		console.error('Get services error:', error);
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
	getBanners,
	getServices,
};
