# n8n-nodes-paynow

This is an n8n community node that integrates Paynow payment gateway into your n8n workflows.

Paynow is a popular payment gateway in Zimbabwe that enables businesses to accept mobile money and card payments. This node allows you to automate payment processing using Paynow's mobile money services directly within your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Roadmap](#roadmap)  
[Resources](#resources)  

## Installation

### For Self-Hosted n8n Instances

#### Step 1: Clone the Repository

```bash
git clone https://github.com/Fambirachimwe/n8n-nodes-paynow.git
cd n8n-nodes-paynow
```

#### Step 2: Install Dependencies

```bash
npm install
```

#### Step 3: Build the Node

```bash
npm run build
```

#### Step 4: Link to Your n8n Instance

Use `npm link` to add the node to your local n8n installation:

```bash
# In the n8n-nodes-paynow directory
npm link

# Navigate to your n8n installation directory (usually ~/.n8n)
cd ~/.n8n
npm link n8n-nodes-paynow
```

#### Step 5: Restart n8n

Restart your n8n instance to load the new node:

```bash
# If running n8n directly
n8n start

# Or if using pm2
pm2 restart n8n
```

### Alternative: Direct Installation via npm

If the package is published to npm, you can install it directly in your n8n custom nodes directory:

```bash
cd ~/.n8n/custom
npm install n8n-nodes-paynow
```

### Community Nodes (Coming Soon)

Once published to the npm registry, you'll be able to install directly from n8n:

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Select **Install a community node**
4. Enter `n8n-nodes-paynow`
5. Click **Install**

## Operations

The Paynow node currently supports the following operations:

### Send Mobile Payment
Initiate a mobile money payment transaction with the following features:
- **Phone Number**: Customer's mobile money number
- **Amount**: Payment amount
- **Currency**: ZWL (Zimbabwean Dollar) or USD (United States Dollar)
- **Payment Method**: Ecocash or Onemoney
- **Auto-polling**: Automatically polls payment status until completed (Paid, Cancelled, or Failed)

The node returns:
- Payment response with transaction details
- Poll URL for status checking
- Final payment status after completion
- Payment reference and poll status

## Credentials

To use this node, you need to authenticate with Paynow. Here's how to set it up:

### Prerequisites
1. Sign up for a Paynow merchant account at [https://www.paynow.co.zw](https://www.paynow.co.zw)
2. Complete the merchant verification process
3. Access your Paynow dashboard

### Getting Your Credentials

1. Log in to your [Paynow Dashboard](https://www.paynow.co.zw/merchant/dashboard)
2. Navigate to **Settings** or **API Settings**
3. You'll find two required values:
   - **Integration ID**: Your unique merchant integration identifier
   - **Integration Key**: Your secret API key

### Setting Up in n8n

1. In your n8n workflow, add the Paynow node
2. Click on **Credential to connect with**
3. Click **Create New Credential**
4. Enter your credentials:
   - **Integration ID**: Paste your Integration ID from Paynow dashboard
   - **Integration Key**: Paste your Integration Key from Paynow dashboard
5. Click **Save**

⚠️ **Security Note**: Keep your Integration Key secure and never share it publicly.

## Compatibility

- **Minimum n8n version**: 0.198.0
- **Tested with**: n8n version 1.116.2
- **Node.js**: Requires Node.js 18 or higher

## Usage

### Basic Payment Workflow

1. Add the **Paynow** node to your workflow
2. Select your Paynow credentials
3. Configure the payment parameters:
   - Enter the customer's phone number (e.g., `0771234567`)
   - Set the payment amount
   - Choose currency (ZWL or USD)
   - Select payment method (Ecocash or Onemoney)
4. Execute the workflow

The node will:
- Create the payment transaction
- Send the payment prompt to the customer's phone
- Poll the payment status every 5 seconds
- Return the final status when complete (or timeout after 2 minutes)

### Example Use Cases

- **E-commerce Checkout**: Automate payment collection when customers place orders
- **Subscription Billing**: Process recurring payments automatically
- **Invoice Processing**: Send payment requests when invoices are generated
- **Webhook Integration**: Trigger payments based on external events

### Important Notes

- The node uses automatic polling to check payment status
- Default timeout is 2 minutes (120 seconds)
- The customer will receive a payment prompt on their mobile device
- Ensure the phone number format matches the mobile money provider's requirements

## Roadmap

We're continuously improving the Paynow node. Here's what's coming next:

### Planned Payment Methods
- ✅ Ecocash (Currently supported)
- ✅ Onemoney (Currently supported)
- 🔄 Innbucks (Coming soon)
- 🔄 Visa/Mastercard (Coming soon)
- 🔄 ZimSwitch (Coming soon)

### Future Features
- Custom polling intervals and timeout configuration
- Webhook support for real-time payment notifications
- Payment status checking as a separate operation
- Refund support
- Batch payment processing

Want to contribute? Feel free to open an issue or submit a pull request on [GitHub](https://github.com/Fambirachimwe/n8n-nodes-paynow).

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [Paynow Official Website](https://www.paynow.co.zw)
- [Paynow API Documentation](https://developers.paynow.co.zw)
- [Report Issues](https://github.com/Fambirachimwe/n8n-nodes-paynow/issues)

## License

[MIT](LICENSE.md)
