import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const data = await request.json();
    console.log("HERE IS A STREAM REQUEST BODY!: ", data);

    if (globalThis.io) {
      globalThis.io.emit('snakeMoved', data);
    }
    
    return new Response(JSON.stringify({ message: 'Data received and broadcasted' }), {
      status: 200,
      headers: {
          'Content-Type': 'application/json',
      },
  });
} catch (error: any) {
		console.error('Error processing request:', error);
		return json({ error: error }, { status: 500 });
	}
}
