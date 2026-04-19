# CSC 317 Group Project - In-Memory REST API

## Group Members
- Bigyan Shrestha (@BigyanShrestha1)
- Sushil Sapkota (@sushilsapkota420)

## Product Description
Our group sells mystery boxes. Each mystery box has a unique id, a name, a theme, a price, and a stock quantity. This API stores and manages a small in-memory inventory of those boxes.

## Data Model
Each mystery box object has the following fields:

- `id`: string
- `name`: string
- `theme`: string
- `price`: number
- `stock`: number

Example:

```json
{
  "id": "box-001",
  "name": "starter surprise",
  "theme": "gaming",
  "price": 24.99,
  "stock": 10
}
