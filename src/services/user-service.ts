import { pool } from "../utils/config"
import { NewUserEntry, UserEntry } from "../types"
import yup from "yup"
import { parseUserEntry } from "../utils/type-parsers"

const schema = yup.object().shape({
  username: yup.string().required().max(50).min(4).trim().strict(true),
  password: yup.string().required().max(50).min(9).trim().strict(true),
})

export const createUser = async (userObj: NewUserEntry): Promise<UserEntry> => {
  const queryText = "INSERT INTO users(username, pwHash) VALUES ($1, $2) RETURNING (id, username)"
  await schema.validate(userObj)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const { rows } = await client.query(queryText, [userObj.username, /* PASSOWRD HERE */])
    await client.query("COMMIT")
    return parseUserEntry(rows[0])
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

export const getUserByID = async (id: number): Promise<UserEntry> => {
  const queryText = "SELECT id FROM users WHERE id = $1"
  const { rows } = await pool.query(queryText, [id])
  return parseUserEntry(rows[0])
}

export const isNameAvailable = async (name: string): Promise<boolean> => {
  const queryText = "SELECT id FROM users WHERE name = $1"
  const { rows } = await pool.query(queryText, [name])
  return rows.length === 0
}