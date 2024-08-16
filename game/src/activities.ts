export async function square(n: number): Promise<number> {
  
    // sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 200));
    
    const result = n * n;
    console.log(`${n}^2 = ${result}`);
  
    // Simulate inventory reservation logic
    return result;
  }