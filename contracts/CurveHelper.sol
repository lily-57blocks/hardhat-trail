// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./interfaces/ICurve.sol";
import "./interfaces/IERC20.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract CurveHelper {
    IERC20 public usdcToken;
    IERC20 public tcrvToken;
    ICurveFi public curve3pool;

    uint256 private constant decimals = 6;

    event Invested(
        address indexed user,
        uint256 usdcAmount,
        uint256 tcrvAmount
    );
    event Withdrawn(
        address indexed user,
        uint256 tcrvAmount,
        uint256 usdcAmount
    );

    constructor(address _tcrvToken, address _usdcToken, address _curve3pool) {
        usdcToken = IERC20(_usdcToken);
        tcrvToken = IERC20(_tcrvToken);
        curve3pool = ICurveFi(_curve3pool);
    }

    function invest(uint256 _usdcAmount) external {
        usdcToken.transferFrom(msg.sender, address(this), _usdcAmount);
        usdcToken.approve(address(curve3pool), _usdcAmount);
        uint256[3] memory amounts = [0, _usdcAmount, 0];
        curve3pool.add_liquidity(amounts, 0);
        uint256 tcrvBalance = tcrvToken.balanceOf(address(this));
        tcrvToken.transfer(msg.sender, tcrvBalance);
        emit Invested(msg.sender, _usdcAmount, tcrvBalance);
    }

    function withdraw(uint256 _tokenAmount) external {
        tcrvToken.transferFrom(msg.sender, address(this), _tokenAmount);
        curve3pool.remove_liquidity_one_coin(_tokenAmount, 1, 0);
        uint256 usdcBalance = usdcToken.balanceOf(address(this));
        usdcToken.transfer(msg.sender, usdcBalance);
        emit Withdrawn(msg.sender, _tokenAmount, usdcBalance);
    }

    receive() external payable {
        revert("Do not send ETH directly");
    }
}
