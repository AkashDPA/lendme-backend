const User = require('../../models/index').user;
const Loan = require('../../models/index').loan;

const { Model, Op } = require('sequelize');
const { buildRes, errLogger } = require('../../utils');

/**
 * @route GET api/loan
 * @desc Register user
 */
exports.getLoan = (req, res) => {
    let offset = req.query?.offset ?? 0;
    let limit = req.query?.limit ?? 10;
    const where = {};

    if(req.query?.amountGte) {
        where.amount = {
            [Op.and]: {
                [Op.gte]: req.query?.amountGte ?? 0,
            }
        }
    }

    Loan.findAll({limit: limit, offset: offset, where: where, include:[
        { model: User, as: 'borrower'}, { model: User, as: 'lender'}
    ]})
        .then(loans => {
            if (!loans instanceof Model){
                return res.status(200).json(buildRes({message: 'No loans found'}));
            } 
            return res.status(200).json(buildRes({success: true, loans: loans}));
        })
        .catch(err => {
            errLogger(err)
            res.status(500).json(buildRes({message: err.message}))
        });
};

/**
 * @route POST api/loan
 * @desc Create new loan
 */
exports.postLoan = (req, res) => {
    const data = { amount, interestRate, payoutFrequency, emiStartDate, tenureMonths, expiryDate, maturityDate, purpose, description } = req.body;
    data.borrowerUserId = req.user.id
    const newLoan = new Loan(data);

    newLoan.save()
        .then(loan => res.status(200).json(buildRes({success: true, loan: loan})))
        .catch(err => {
            errLogger(err)
            res.status(500).json(buildRes({message: err.message}))
        });
};

/**
 * @route POST api/auth/login
 * @desc Login user and return JWT token
 */
 exports.loanDetails = (req, res) => {
    Loan.findOne({ where: {id: req.params.loanId}, include:[
        { association: 'rps'}, {association: 'lender'}, {association: 'borrower'}
    ]})
        .then(loansDetails => {
            if (!loansDetails){
                return res.status(200).json(buildRes({message: 'No loans found'}));
            } 
            return res.status(200).json(buildRes({success: true, loan: loansDetails}));
        })
        .catch(err => {
            errLogger(err)
            res.status(500).json(buildRes({message: err.message}))
        });
};

