module.exports = class UserDto {
  id;
  firstName;
  lastName;
  username;

  constructor(model) {
    this.id = model._id;
    this.firstName = model.firstName;
    this.lastName = model.lastName;
    this.username = model.username;
  }
};
