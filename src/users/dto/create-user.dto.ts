export class CreateUserDto {
    created_date: Date
    first_name: string
    last_name: string
    email: string
    password: string
    phone: number
    role: string
  static token: string
}