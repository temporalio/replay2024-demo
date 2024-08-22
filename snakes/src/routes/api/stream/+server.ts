import { json } from '@sveltejs/kit';

export async function POST({ request }) {
	try {
		const body = await request.json();
		const { action, name, team, workflowId, gameWorkflowId, duration, input, snake } = body;



  } catch (error: any) {
    const text = error.text();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(`data: ${text}\n\n`);
      }
    });

		console.error('Error processing request:', error);
		return json({ error: error.message }, { status: 500 });
	}

  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(`data: ${text}\n\n`);
    }
  });

  return new Response(readable, {
    headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache"
    }
  }
}
