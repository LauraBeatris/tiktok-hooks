import { Autumn } from "autumn-js"
import { cookies } from "next/headers"

const autumn = new Autumn()

const CUSTOMER_ID_COOKIE_NAME = "customer_id"

/**
 * Creates a unique customer ID based on the current browser session
 * PS: On a real production app, we'd leverage an entity ID, such as user, team, etc
 */
export async function getCustomerId() {
  const result = await cookies()
  const customerId = result.get(CUSTOMER_ID_COOKIE_NAME)

  if (customerId) {
    return customerId
  }

  const randomUUID = crypto.randomUUID()
  result.set(CUSTOMER_ID_COOKIE_NAME, randomUUID)

  await autumn.customers.getOrCreate(({ customerId: randomUUID }))
}
