import { createJiti } from 'jiti'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const jiti = createJiti(import.meta.url, { jsx: true })

console.log('================================================================')
console.log('  AEVION SHOES COMPREHENSIVE REGRESSION TEST SUITE RUNNER       ')
console.log('================================================================')
console.log(`Execution Timestamp: ${new Date().toISOString()}`)
console.log(`Node.js Version: ${process.version}`)
console.log(`Test Directory: ${__dirname}\n`)

const testSuites = [
  { name: '1. Backend Regression Suite (Razorpay, HMAC SHA256, OrderStore, ApiClient)', path: './backend.test.ts' },
  { name: '2. Auth Regression Suite (Signup, Login, Tokens, LocalStorage)', path: './auth.test.ts' },
  { name: '3. Cart & Pricing Regression Suite (Sizing, Quantities, Subtotal, Stock Deduction)', path: './cart-pricing.test.ts' },
  { name: '4. Admin Operations Regression Suite (Inventory, Thresholds, Fulfillment)', path: './admin.test.ts' },
]

async function run() {
  const startTime = Date.now()

  for (const suite of testSuites) {
    console.log(`\n⏳ Loading Suite: ${suite.name}...`)
    await jiti.import(suite.path)
  }

  // Allow node:test harness to complete subtests and report summary
  process.on('exit', (code) => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log('\n================================================================')
    if (code === 0) {
      console.log(`✅ ALL REGRESSION TEST SUITES PASSED SUCCESSFULLY (${elapsed}s)`)
    } else {
      console.log(`❌ REGRESSION SUITE FAILED WITH EXIT CODE ${code} (${elapsed}s)`)
    }
    console.log('================================================================\n')
  })
}

run().catch((error) => {
  console.error('\n❌ Unhandled exception while executing test suites:\n', error)
  process.exit(1)
})
