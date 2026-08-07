// ====================== remedies.js ======================

const remediesDatabase = {
    "Late Blight": {
        crop: "Tomato, Potato",
        remedies: [
            {
                name: "Ridomil Gold",
                type: "Chemical",
                availability: ["Kenya", "Tanzania", "Uganda"],
                cost: "Medium",
                shops: "Agrovet shops, Cooperatives",
                method: "Spray every 7-10 days",
                organic: "Neem oil + Garlic extract"
            },
            {
                name: "Neem Oil + Soap",
                type: "Organic",
                availability: ["All East Africa"],
                cost: "Low",
                shops: "Local markets, Agrovet",
                method: "Spray weekly",
                organic: "Fully organic"
            }
        ]
    },

    "Early Blight": {
        crop: "Tomato, Potato",
        remedies: [
            {
                name: "Mancozeb",
                type: "Chemical",
                availability: ["Kenya", "Uganda"],
                cost: "Low",
                shops: "Agrovet",
                method: "Preventive spray",
                organic: "Baking soda solution"
            }
        ]
    },

    // Add more diseases here...
    "Fall Armyworm": {
        crop: "Maize",
        remedies: [
            {
                name: "Emamectin Benzoate",
                type: "Chemical",
                availability: ["Kenya"],
                cost: "Medium",
                shops: "Agrovet",
                method: "Spray on leaves",
                organic: "Bt (Bacillus thuringiensis)"
            }
        ]
    }
};

// Function to get remedies
function getRemedies(diseaseName, userCountry = "Kenya") {
    const disease = remediesDatabase[diseaseName];
    if (!disease) return null;

    return disease.remedies.map(remedy => ({
        ...remedy,
        isLocallyAvailable: remedy.availability.includes(userCountry)
    }));
}

// Export for use in other files
window.remediesDatabase = remediesDatabase;
window.getRemedies = getRemedies;