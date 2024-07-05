# Startup: The Game

Play here: https://startup.miso.one/

This is a MVP of fully on-chain business simulation game I've built for Solana Speedrun 3.

![startup](https://github.com/dwrx/startup-game/assets/65243529/191a2544-9c9a-4cac-90b1-754d1ebbe250)

## Basic Mechanics

### Legal Businesses
Legal businesses generate clean cash out of illicit funds with a -30% loss. Players can purchase and upgrade these businesses to increase their earnings. 
The initial legal businesses available are:

1. **Laundry**
2. **Fast Food Restaurant**
3. **Fitness Center**

### Illegal Businesses
Illegal businesses generate dirty cash. Players can use these businesses to earn more money but will need to launder the dirty cash through legal businesses. The initial illegal businesses available are:

1. **Unlicensed Bar**
2. **Cannabis Farm**
3. **Strip Club**
4. **Casino**

### Supporting Rooms
Supporting rooms do not generate cash but provide additional benefits.

1. **Saferoom**: Protects illegal cash from being stolen.
2. **Security Room**: Allows to recruit enforcers and hitmen to protect the business or attack other players.

## How It Works

### Purchasing Rooms
Players start with a $500 of clean cash, which they can use to purchase their first legal and illegal businesses. Each room type has a cost and an experience requirement. 

### Generating Cash
Each business generates cash every second, based on its yield rate and storage capacity. Players need to collect the cash manually. If the storage capacity is full, the business will stop generating cash until the player collects it.

### Laundering Money
Dirty cash generated from illegal businesses can be laundered through legal businesses. There is a 30% loss when converting dirty cash to clean cash.

### Upgrading Rooms
[WIP] Rooms can be upgraded to increase their yield and storage capacity.

### Protecting and Attacking
[WIP] Players can recruit enforcers and hitmen to protect their businesses from attacks or to attack other players and steal their uncollected dirty cash.

## License

This project is built for fun and licensed under the MIT License.
