import { exec } from 'child_process';

console.log('Generating database migrations...');

exec('npx drizzle-kit generate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Execution error: ${error.message}`);
    process.exit(1);
  }
  if (stderr) {
    console.error(`drizzle-kit stderr: ${stderr}`);
  }
  console.log(stdout);
  console.log('Migrations generated successfully!');
});