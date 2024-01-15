// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.24;

/**
 * @title Roles
 * @dev Library for managing addresses assigned to a Role.
 */
library Roles {
  struct Role {
    mapping (address => bool) bearer;
  }

  /**
   * @dev give an account access to this role
   */
  function add(Role storage role, address account) internal {
    require(account != address(0), "account can not be the genesis account");
    require(!has(role, account), "This account should'nt have access initially");

    role.bearer[account] = true;
  }

  /**
   * @dev remove an account's access to this role
   */
  function remove(Role storage role, address account) internal {
    require(account != address(0), "account can not be the genesis account");
    require(has(role, account), "This account should have access initially");

    role.bearer[account] = false;
  }

  /**
   * @dev check if an account has this role
   * @return bool
   */
  function has(Role storage role, address account)
    internal
    view
    returns (bool)
  {
    require(account != address(0), "account can not be the genesis account");
    return role.bearer[account];
  }
}