require('dotenv').config();
const Stripe = require('stripe');

async function verifyStripeConfig() {
  try {
    // Initialize Stripe with the secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get all webhooks
    console.log('🔍 Fetching webhook endpoints...');
    const webhooks = await stripe.webhookEndpoints.list();
    
    // Find our production webhook
    const prodWebhook = webhooks.data.find(
      webhook => webhook.url === 'https://parkalgo.com/api/stripe/webhook'
    );
    
    if (!prodWebhook) {
      console.error('❌ Production webhook not found!');
      console.log('Existing webhooks:');
      webhooks.data.forEach(webhook => {
        console.log(`- ${webhook.url} (${webhook.status})`);
      });
      return;
    }
    
    console.log('✅ Production webhook found:', {
      id: prodWebhook.id,
      status: prodWebhook.status,
      url: prodWebhook.url,
      enabled_events: prodWebhook.enabled_events,
      api_version: prodWebhook.api_version
    });

    // Get the list of products and prices
    console.log('\n🔍 Fetching products and prices...');
    const products = await stripe.products.list({ active: true });
    const prices = await stripe.prices.list({ active: true });

    console.log('✅ Active products:');
    products.data.forEach(product => {
      console.log(`- ${product.name} (${product.id})`);
      const productPrices = prices.data.filter(price => price.product === product.id);
      productPrices.forEach(price => {
        console.log(`  • ${price.nickname || price.id}: ${(price.unit_amount / 100).toFixed(2)} ${price.currency}`);
      });
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyStripeConfig();
