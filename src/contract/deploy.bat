@echo off
echo Deploying contract to Ethereum local...
truffle migrate --network development --reset

echo Deploying contract to Polygon local...
truffle migrate --network polygon_ganache --reset

echo Deploying contract to Binance local...
truffle migrate --network binance_ganache --reset

echo Deployment complete.
pause
