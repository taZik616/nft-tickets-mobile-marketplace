import {anyValue} from '@nomicfoundation/hardhat-chai-matchers/withArgs'
import {expect} from 'chai'
import {ethers} from 'hardhat'

import {NftTickets, NftTicketsMarketplace} from '../typechain-types'

const TICKETS_AMOUNT = 500
const IPFS_HASH = 'ipfs-hash'

describe('NFT-Tickets', function () {
  let Tickets: NftTickets, TicketsMarketplace: NftTicketsMarketplace

  beforeEach(async () => {
    // const accounts = await ethers.getSigners()

    Tickets = (await (
      await ethers.getContractFactory('NftTickets')
    ).deploy()) as NftTickets
    TicketsMarketplace = (await (
      await ethers.getContractFactory('NftTicketsMarketplace')
    ).deploy(Tickets.address)) as NftTicketsMarketplace
  })

  describe('General tests', function () {
    it('Сreating not valid tickets', async function () {
      expect(Tickets.createTicket(500, '')).to.be.revertedWithCustomError(
        Tickets,
        'ipfsHashShouldNotBeEmptyString',
      )
      // @ts-ignore
      expect(Tickets.createTicket(500)).to.be.revertedWithCustomError(
        Tickets,
        'ipfsHashShouldNotBeEmptyString',
      )

      expect(
        Tickets.createTicket(0, 'heofu382h2'),
      ).to.be.revertedWithCustomError(Tickets, 'AmountMustBeAboveZero')
    })
    it('Сreating tickets', async function () {
      const accounts = await ethers.getSigners()
      const ticketID = 1

      expect(Tickets.createTicket(TICKETS_AMOUNT, IPFS_HASH))
        .to.emit(Tickets, 'TicketCreated')
        .withArgs(accounts[0], anyValue, TICKETS_AMOUNT, IPFS_HASH)

      expect(await Tickets.balanceOf(accounts[0].address, ticketID)).to.equal(
        TICKETS_AMOUNT,
      )
      expect(await Tickets.uri(ticketID)).to.equal(
        `https://ipfs.io/ipfs/${IPFS_HASH}`,
      )
      expect(await Tickets.getTicketCreator(ticketID)).to.equal(
        accounts[0].address,
      )
    })

    it('Assign ticket collectors', async function () {
      const [, collector, guest] = await ethers.getSigners()
      Tickets.createTicket(TICKETS_AMOUNT, IPFS_HASH)

      expect(
        Tickets.connect(guest).changeTicketCollectors(
          1,
          collector.address,
          true,
        ),
      ).to.be.revertedWithCustomError(Tickets, 'OnlyStaffOwnerCanDoThis')
      expect(await Tickets.connect(collector).canCollectTicket(1)).to.be.false

      expect(Tickets.changeTicketCollectors(1, collector.address, true))
        .to.emit(Tickets, 'StaffCollectorsChanged')
        .withArgs(1, collector.address, true)

      expect(await Tickets.connect(collector).canCollectTicket(1)).to.be.true
    })

    // it('Should set the right owner', async function () {
    //   const {lock, owner} = await loadFixture(deployOneYearLockFixture)

    //   expect(await lock.owner()).to.equal(owner.address)
    // })

    // it('Should receive and store the funds to lock', async function () {
    //   const {lock, lockedAmount} = await loadFixture(deployOneYearLockFixture)

    //   expect(await ethers.provider.getBalance(lock.address)).to.equal(
    //     lockedAmount,
    //   )
    // })

    // it('Should fail if the unlockTime is not in the future', async function () {
    //   // We don't use the fixture here because we want a different deployment
    //   const latestTime = await time.latest()
    //   const Lock = await ethers.getContractFactory('Lock')
    //   await expect(Lock.deploy(latestTime, {value: 1})).to.be.revertedWith(
    //     'Unlock time should be in the future',
    //   )
    // })
  })
})

// import {anyValue} from '@nomicfoundation/hardhat-chai-matchers/withArgs'
// import {loadFixture, time} from '@nomicfoundation/hardhat-network-helpers'
// import {expect} from 'chai'
// import {ethers} from 'hardhat'

// describe('Lock', function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployOneYearLockFixture() {
//     const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60
//     const ONE_GWEI = 1_000_000_000

//     const lockedAmount = ONE_GWEI
//     const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners()

//     const Lock = await ethers.getContractFactory('Lock')
//     const lock = await Lock.deploy(unlockTime, {value: lockedAmount})

//     return {lock, unlockTime, lockedAmount, owner, otherAccount}
//   }

//   describe('Deployment', function () {
//     it('Should set the right unlockTime', async function () {
//       const {lock, unlockTime} = await loadFixture(deployOneYearLockFixture)

//       expect(await lock.unlockTime()).to.equal(unlockTime)
//     })

//     it('Should set the right owner', async function () {
//       const {lock, owner} = await loadFixture(deployOneYearLockFixture)

//       expect(await lock.owner()).to.equal(owner.address)
//     })

//     it('Should receive and store the funds to lock', async function () {
//       const {lock, lockedAmount} = await loadFixture(deployOneYearLockFixture)

//       expect(await ethers.provider.getBalance(lock.address)).to.equal(
//         lockedAmount,
//       )
//     })

//     it('Should fail if the unlockTime is not in the future', async function () {
//       // We don't use the fixture here because we want a different deployment
//       const latestTime = await time.latest()
//       const Lock = await ethers.getContractFactory('Lock')
//       await expect(Lock.deploy(latestTime, {value: 1})).to.be.revertedWith(
//         'Unlock time should be in the future',
//       )
//     })
//   })

//   describe('Withdrawals', function () {
//     describe('Validations', function () {
//       it('Should revert with the right error if called too soon', async function () {
//         const {lock} = await loadFixture(deployOneYearLockFixture)

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet",
//         )
//       })

//       it('Should revert with the right error if called from another account', async function () {
//         const {lock, unlockTime, otherAccount} = await loadFixture(
//           deployOneYearLockFixture,
//         )

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime)

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner",
//         )
//       })

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const {lock, unlockTime} = await loadFixture(deployOneYearLockFixture)

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime)

//         await expect(lock.withdraw()).not.to.be.reverted
//       })
//     })

//     describe('Events', function () {
//       it('Should emit an event on withdrawals', async function () {
//         const {lock, unlockTime, lockedAmount} = await loadFixture(
//           deployOneYearLockFixture,
//         )

//         await time.increaseTo(unlockTime)

//         await expect(lock.withdraw())
//           .to.emit(lock, 'Withdrawal')
//           .withArgs(lockedAmount, anyValue) // We accept any value as `when` arg
//       })
//     })

//     describe('Transfers', function () {
//       it('Should transfer the funds to the owner', async function () {
//         const {lock, unlockTime, lockedAmount, owner} = await loadFixture(
//           deployOneYearLockFixture,
//         )

//         await time.increaseTo(unlockTime)

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount],
//         )
//       })
//     })
//   })
// })
