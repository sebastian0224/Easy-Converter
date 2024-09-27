import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Initialize the Express application
const app = express();
const port = 3000;

// API configuration
const API_URL = "https://v6.exchangerate-api.com/v6/";
const APIkey = "882b14a7b3a4bdfe19d310aa";

// Middleware for serving static files and parsing URL-encoded data
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Route for GET requests to the home page
app.get('/', async (req, res) => {
    try {
        // Fetch supported currency codes from the API
        const getResponse = await axios.get(API_URL + APIkey + "/codes");
        const currenciesCodes = getResponse.data.supported_codes;
        // Render the index.ejs template with the currency codes
        res.render("index.ejs", { currenciesCodes });
    } catch (error) {
        // Render the index.ejs template with the error message if the API call fails
        res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    }
});

// Route for POST requests to convert currency
app.post('/', async (req, res) => {
    try {
        // Extract and process form data
        const base = req.body.base.slice(0, 3); // Base currency code
        const target = req.body.target.slice(0, 3); // Target currency code
        const targetCurrency = req.body.target.slice(4, req.body.target.length); // Target currency name
        const amount = req.body.amount; // Amount to convert

        // Fetch supported currency codes from the API
        const getResponse = await axios.get(API_URL + APIkey + "/codes");
        const currenciesCodes = getResponse.data.supported_codes;

        // Fetch conversion rate between base and target currencies
        const postResponse = await axios.get(API_URL + APIkey + "/pair/" + base + "/" + target);
        const result = parseInt(postResponse.data.conversion_rate * amount); // Calculate the converted amount

        // Render the index.ejs template with conversion results
        res.render("index.ejs", { currenciesCodes, result, amount, base, target, targetCurrency });
    } catch (error) {
        const currenciesCodes = []; // Initialize currencies codes as empty
        const result = null; // Set result to null on error
        const errorMessage = error.response ? JSON.stringify(error.response.data) : "Unknown error"; // Handle error message
        // Render the index.ejs template with the error message
        res.render("index.ejs", { currenciesCodes, result, content: errorMessage });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
