<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/yourusername/trickle">
    <img src="./frontend/public/trickle_icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Trickle</h3>

  <p align="center">
    A Web3 Investment Assistant with Real-time Transaction Monitoring
    <br />
    <a href="https://github.com/JasonYapzx/trickle"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#">View Demo</a>
    ·
    <a href="#">Chrome Extension</a>
    ·
    <a href="#">Report Bug</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

<h3>Overview</h3>

Trickle is a comprehensive Web3 investment assistant that helps users monitor and manage their blockchain transactions. It combines a Chrome extension for real-time transaction monitoring, a chat interface powered by AI for insights, and smart contracts for automated micro-investments.

<h3>Key Features</h3>

- **Chrome Extension**: Monitor blockchain transactions and receive real-time notifications
- **AI-Powered Chat Interface**: Get insights about your wallet transactions and blockchain trends
- **Smart Contract Integration**: Automated micro-investment functionality through MultiBaas API
- **Real-time Socket Service**: Instant notifications for investment opportunities and transaction updates
- **TRKL Token**: Native token for platform governance and rewards

<p align="right">(<a href="#top">back to top</a>)</p>

<br />

### Built With

Trickle is built with modern web and blockchain technologies:

- [![Next.js][nextjs]][nextjs-url] - React framework for the frontend
- [![Tailwind][tailwind]][tailwind-url] - Utility-first CSS framework
- [![Hardhat][hardhat]][hardhat-url] - Ethereum development environment
- [![Curvegrid][curvegrid]][curvegrid-url] - Blockchain API integration with MultiBaas
- [![nodit][nodit]][nodit-url] - Web3 Development Platform with API Integrations
- [![1inch][1inch]][1inch-url] - Definitive DeFi platform
- [![Saga][saga]][saga-url] - Launching a dedicated EVM compatible Layer-1 blockchain

[hardhat]: https://img.shields.io/badge/Hardhat-181A1F?style=for-the-badge
[hardhat-url]: https://hardhat.org
[socketio-url]: https://socket.io
[curvegrid]: https://img.shields.io/badge/CurveGrid-E13839?style=for-the-badge
[curvegrid-url]: https://www.curvegrid.com/multibaas
[nodit-url]: https://nodit.io/
[nodit]: https://img.shields.io/badge/nodit-04D179?style=for-the-badge
[1inch-url]: https://1inch.io/
[1inch]: https://img.shields.io/badge/1inch-190926?style=for-the-badge
[saga-url]: https://www.saga.xyz/
[saga]: https://img.shields.io/badge/saga-ffffff?style=for-the-badge

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or bun package manager
- Chrome browser for extension testing
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/JasonYapzx/trickle.git
   cd trickle
   ```

2. Frontend Setup
   ```sh
   cd frontend
   npm install
   # Create .env file with required variables
   npm run dev
   ```

3. Chrome Extension Setup
   ```sh
   cd ../chrome-extension
   # Load unpacked extension in Chrome:
   # 1. Open Chrome > Extensions
   # 2. Enable Developer Mode
   # 3. Click "Load unpacked"
   # 4. Select the chrome-extension directory
   ```

4. Socket Service Setup
   ```sh
   cd ../nodit-socket
   npm install
   node investment-detected.js
   ```

5. Smart Contract Deployment
   ```sh
   cd ../smart-contract
   npm install
   # Configure your network in hardhat.config.js
   npx hardhat compile
   npx hardhat run scripts/deploy.js
   ```

6. TRKL Token Setup
   ```sh
   cd ../trkl-token
   npm install
   npx hardhat compile
   npx hardhat run scripts/deploy.ts
   ```

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

<h3>Chrome Extension</h3>

1. Install the Chrome extension from the Chrome Web Store or load it unpacked:
   ```sh
   # Navigate to chrome://extensions/
   # Enable Developer Mode
   # Click "Load unpacked" and select the chrome-extension directory
   ```

2. Connect your Web3 wallet (MetaMask recommended)

3. The extension will automatically monitor your transactions and display notifications for:
   - New transactions
   - Investment opportunities
   - Price alerts
   - Smart contract interactions

<h3>AI Chat Interface</h3>

1. Access the chat interface at `https://trickle-kappa.vercel.app/app/chatbot`

2. Get insights about:
   - Your wallet's transaction history
   - Investment recommendations
   - Market trends and analysis
   - Smart contract interactions

<h3>Smart Contract Integration</h3>

1. Set up automated micro-investments throught our chrome extension:

2. Monitor your investments:
   - View active investment rules
   - Track investment performance
   - Manage TRKL token rewards

3. Customize triggers:
   - Transaction-based investments
   - Time-based DCA (Dollar Cost Averaging)
   - Price-based limit orders

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

Our vision for Trickle's future development encompasses several key areas:

### Enhanced User Authentication and Personalization
- Integration with World ID for secure, privacy-preserving authentication
- Personalized investment recommendations based on user profiles
- Targeted strategies considering age, income, and risk tolerance levels

### Expanded Token Utility and Saga Integration
- Advanced token mechanics including staking mechanisms
- NFT rewards system through Saga integration
- Trading multipliers for enhanced user engagement

### Comprehensive Rewards System
- Token multipliers for active platform participation
- Staking benefits and governance rights
- Trading tokens for platform discounts and premium features
- Dynamic reward tiers based on user activity and investment volume

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Jason - [Linkedin](https://www.linkedin.com/in/ja-sony/)

Eugene - [LinkedIn](https://www.linkedin.com/in/eugenetayyj/)

Shaune - [LinkedIn](https://www.linkedin.com/in/shauneang/)

Aden - [LinkedIn](https://www.linkedin.com/in/aden-teo/)

Project Link: [GitHub](https://github.com/JasonYapzx/trickle)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ACKNOWLEDGEMENTS --> 

## Acknowledgements
We appreciate the following tools and libraries that make Trickle possible:

1. [Hardhat](https://hardhat.org/) - Ethereum development environment
2. [MultiBaas](https://www.curvegrid.com/multibaas) - Blockchain API integration
3. [World ID](https://worldcoin.org/world-id) - Secure user authentication
4. [OpenZeppelin](https://www.openzeppelin.com/) - Smart contract libraries
5. [Tailwind CSS](https://tailwindcss.com/) - UI styling
6. [Next.js](https://nextjs.org/) - React framework
7. [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) - Browser integration
8. [1inch API](https://1inch.io/api/) - DeFi aggregation protocol
9. [Saga](https://www.saga.xyz/) - Layer-1 blockchain infrastructure
10. [Socket.io](https://socket.io/) - Real-time event handling

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[nextjs]: https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white
[nextjs-url]: https://nextjs.org/
[tailwind]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[tailwind-url]: https://tailwindcss.com/
