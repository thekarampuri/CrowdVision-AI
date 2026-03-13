# Contributing to CrowdVision AI

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to CrowdVision AI. These are just guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## 🛠️ How to Contribute

### 1. Fork the Repository
Fork this repository to your own GitHub account.

### 2. Clone the Repository
Clone your fork to your local machine:
```bash
git clone https://github.com/YOUR_USERNAME/CrowdVision-AI.git
cd CrowdVision-AI
```

### 3. Create a Branch
Create a branch for your feature or fix. Use a descriptive name:
```bash
git checkout -b feature/amazing-new-feature
# or
git checkout -b fix/critical-bug-fix
```

### 4. Make Your Changes
Implement your feature or fix.
- Ensure your code follows the existing style.
- If adding dependencies, update the relevant files (`package.json`, `requirements.txt`).

### 5. Commit Your Changes
Commit your changes with a clear and descriptive message:
```bash
git commit -m "Add: Real-time heatmap animation"
```

### 6. Push to Your Fork
Push your branch to your forked repository:
```bash
git push origin feature/amazing-new-feature
```

### 7. Submit a Pull Request
Go to the original repository and open a Pull Request (PR) from your fork.
- Provide a clear title and description.
- Explain what you changed and why.
- Attach screenshots if you modified the UI.

## 🧪 Testing

Before submitting, please verify your changes:
- **Frontend**: Run `npm run dev` and check for console errors.
- **ML Server**: Ensure the Flask server starts (`python app.py`) and detects people correctly.
- **Mobile**: Build the app in Android Studio and ensure it runs on an emulator/device.

## 📄 License
By contributing, you agree that your contributions will be licensed under its MIT License.
