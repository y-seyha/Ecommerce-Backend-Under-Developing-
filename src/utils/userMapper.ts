import { IUser } from "../model/user.model.js";
import { UpdateUserDTO } from "../dto/user.dto.js";

// Maps UpdateUserDTO to a full IUser object for repository update
export const mapUpdateUserDTOToIUser = (
  existingUser: IUser,
  dto: UpdateUserDTO,
): IUser => {
  return {
    id: existingUser.id,
    first_name: dto.first_name ?? existingUser.first_name,
    last_name: dto.last_name ?? existingUser.last_name,
    email: existingUser.email,
    password: dto.password ?? existingUser.password,
    role: dto.role ?? existingUser.role,
    created_at: existingUser.created_at,
    updated_at: new Date(),
  };
};
