export const mongoConfig = {
    mongoURI: `${process.env.MONGODB_URL}/car_dealership_dev`,
    mongoSetup: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	},
}