
# PyroCycle AI

An AI-powered plastic recovery platform that connects waste workers with recyclers and industries. PyroCycle AI helps workers identify plastic, estimate its value, find nearby buyers and request pickups, while the Industry Portal uses batch composition and machine-learning-based pyrolysis yield prediction to support processing decisions. By making plastic recovery more accessible, transparent and economically viable, the platform also aims to reduce plastic waste in the environment and contribute to a cleaner and more sustainable future.



## Features

- Transparent Worker Valuation
- AI-Powered Pyrolysis Yield Prediction
- Direct Worker-to-Industry Connection
- Smart Plastic Batch Valuation & Assessment


## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS

**Backend:** Python, Flask

**Machine Learning:** Scikit-learn, Random Forest, Pandas

**Data & Storage:** JSON, Browser Local Storage

**Deployment:** Vercel


## Demo

**Live Demo:** [PyroCycle AI](https://pyro-cycle-ai.vercel.app/)

**Video Walkthrough:** [Watch on YouTube](https://youtu.be/dF5xa3E3CPw)

The video demonstrates the complete Worker-to-Industry workflow, including worker valuation, batch creation, buyer and pickup requests, industry-side batch analysis, and pyrolysis yield prediction.



## Screenshots

### Transparent Worker Valuation & Pickup
![Worker Valuation and Pickup](https://github.com/dhruvsingh3105-art/PyroCycle-AI/blob/main/Screenshots/Screenshot%202026-08-23%20125053.png)

### Industry AI Pyrolysis Prediction
![Industry Pyrolysis Prediction](https://github.com/dhruvsingh3105-art/PyroCycle-AI/blob/main/Screenshots/Screenshot%202026-08-23%20125240.png)


## API Reference

#### Predict Pyrolysis Yield

```http
POST /predict
```

Accepts plastic composition and pyrolysis process parameters and returns predicted product yields.

| Parameter | Type | Description |
| :-------- | :--- | :---------- |
| `plastic_type` | `string` | Type of plastic being processed |
| `temperature` | `number` | Pyrolysis temperature |
| `heating_rate` | `number` | Heating rate |
| `particle_size` | `number` | Feed particle size |
| `feed_size` | `number` | Feed size |
| `catalyst` | `string` | Catalyst used |
| `reactor_type` | `string` | Type of reactor |

#### Response

Returns estimated pyrolysis product yields:

```json
{
  "oil": 36.55,
  "gas": 28.55,
  "wax": 25.38,
  "char": 9.52
}
```



## Deployment

The project is deployed on Vercel.

**Live Application:** https://pyro-cycle-ai.vercel.app/


## Installation

Install the project with npm

```bash
git clone https://github.com/dhruvsingh3105-art/PyroCycle-AI.git
cd PyroCycle-AI/frontend
npm install
```
## Usage/Examples

### Worker Portal

Workers can assess a plastic batch, enter its weight, view its estimated value and deductions, and connect with nearby buyers for pickup.

**Example:** A worker submits a 70 kg batch to GreenCycle Aggregator and confirms the pickup request.

### Industry Portal

Industries receive the batch details, review its composition and weight, and use the prediction system to estimate pyrolysis yields.

**Example:** The industry predicts potential oil, gas, wax, and char yields to evaluate the batch for processing.

## Limitations and Prototype Notes

- **Plastic Composition:** The current image-assessment workflow uses predefined composition outputs to demonstrate the intended AI pipeline. A production version would integrate a trained computer-vision model for real-time polymer identification.

- **Nearby Buyers & Pickup:** The current buyer and pickup locations use predefined demo data. A production version would integrate GPS/location APIs and a verified recycler database for dynamic results.

## Future Scope

- Integrate a trained computer-vision model for real-time plastic composition detection.
- Connect live GPS/location services with a verified recycler and buyer network.
- Replace prototype storage with a centralized database and secure user authentication.
- Integrate real-time plastic market prices for dynamic and location-based valuation.
## Authors

**Dhruv Singh**: Industry Portal development, video production and project presentation.

**Bhargav Udatala**: Worker Portal development, user workflow design and project presentation.

**Suryansh Chauhan**: Experimental dataset development, research support and project presentation.
