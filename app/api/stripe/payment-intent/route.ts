import { NextRequest, NextResponse } from 'next/server';
import { APIError, handleAPIError } from '@/lib/api-error';
import { verifyUser, isUserSubscribed } from '@/lib/server-auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(req: NextRequest) {
  try {
    // Verify that user is authenticated
    const { user } = await verifyUser();

    // Verify subscription status for premium features
    const hasSubscription = await isUserSubscribed();
    if (hasSubscription) {
        // If the user is already subscribed, redirect them to the billing portal
        // to manage their subscription.
        const { profile } = await verifyUser(); // Re-verify to get profile
        if (profile?.stripe_customer_id) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
            });
            return NextResponse.json({ url: stripeSession.url });
        }
    }

    const { amount, currency = 'usd', metadata = {} } = await req.json();
    
    if (!amount || amount < 50) { // Minimum amount is 50 cents
      throw new APIError('Invalid amount', 400, 'payment/invalid_amount');
    }

    // Validate currency
    if (!['usd', 'eur', 'gbp'].includes(currency.toLowerCase())) {
      throw new APIError('Invalid currency', 400, 'payment/invalid_currency');
    }

    // Create payment intent with enhanced metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        userId: user.id,
        email: user.email ?? '',
      },
      automatic_payment_methods: { 
        enabled: true,
        allow_redirects: 'never', // Prevent manual bank transfers for security
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
