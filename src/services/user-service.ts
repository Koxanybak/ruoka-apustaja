import { pool } from "../utils/config"
import { NewUserEntry, UserEntry, } from "../types"
import * as yup from "yup"
import { hash } from "bcrypt"
import { parseUserEntry } from "../utils/type-parsers"
import { NoContentError } from "../utils/errors"

const schema = yup.object().shape({
  username: yup.string().required().max(50).min(4).trim().strict(true),
  password: yup.string().required().max(50).min(9).trim().strict(true),
})

export const createUser = async (userObj: NewUserEntry): Promise<UserEntry> => {
  const queryText = "INSERT INTO users(username, pwHash) VALUES ($1, $2) RETURNING id, username"
  await schema.validate(userObj)
  const pwHash = await hash(userObj.password, 10)

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const { rows } = await client.query(queryText, [userObj.username, pwHash])
    await client.query("COMMIT")
    return parseUserEntry(rows[0])
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

export const getUserByID = async (id: number): Promise<UserEntry | undefined> => {
  const queryText = "SELECT id, username FROM users WHERE id = $1"
  const { rows } = await pool.query(queryText, [id])
  if (rows.length === 0) throw new NoContentError("User not found")
  return parseUserEntry(rows[0])
}

export const getUserByName = async (name: string): Promise<UserEntry | undefined> => {
  const queryText = "SELECT id, username, pwHash FROM users WHERE name = $1"
  const { rows } = await pool.query(queryText, [name])
  return parseUserEntry(rows[0])
}

export const isNameAvailable = async (name: string): Promise<boolean> => {
  const queryText = "SELECT id FROM users WHERE name = $1"
  const { rows } = await pool.query(queryText, [name])
  return rows.length === 0
}