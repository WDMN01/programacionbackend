
import User from './userModel.js';

class UserFactory {
  static createUser(data) {
    return new User(data);
  }
}

export default UserFactory;