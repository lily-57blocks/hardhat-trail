// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ICurveFi {
    function get_virtual_price() external view returns (uint256);
    function add_liquidity(uint256[3] calldata amounts, uint256 min_mint_amount) external;
    function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 min_amount) external;
}