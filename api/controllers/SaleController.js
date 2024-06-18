const express = require("express");
const app = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

app.post('/save', async (req, res) => {
    try {
        const rowBillSale = await prisma.billSale.create({
            data: {
                customerName: req.body.customerName,
                customerPhone: req.body.customerPhone,
                customerAddress: req.body.customerAddress,
                payDate: new Date(req.body.payDate),
                payTime: req.body.payTime
            }
        });

        for (let i = 0; i < req.body.carts.length; i++) {
            const rowProduct = await prisma.product.findFirst({
                where: {
                    id: req.body.carts[i].id
                }
            })

            await prisma.billSaleDetail.create({
                data: {
                    billSaleId: rowBillSale.id,
                    productId: rowProduct.id,
                    cost: rowProduct.cost,
                    price: rowProduct.price
                }
            });
        }

        res.send({ message: 'success' });
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/list', async (req, res) => {
    try {
        const results = await prisma.billSale.findMany({
            orderBy: {
                id: 'desc'
            }
        })

        res.send({ results: results })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/billInfo/:billSaleId', async (req, res) => {
    try {
        const results = await prisma.billSaleDetail.findMany({
            include: {
                Product: true
            },
            where: {
                billSaleId: parseInt(req.params.billSaleId)
            },
            orderBy: {
                id: 'desc'
            }
        });

        res.send({ results: results })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

app.get('/updateStatusToPay/:billSaleId', async (req, res) => {
    try {
        await prisma.billSale.update({
            data: {
                status: 'pay'
            },
            where: {
                id: parseInt(req.params.billSaleId)
            }
        })

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/updateStatusToSend/:billSaleId', async (req, res) => {
    try {
        await prisma.billSale.update({
            data: {
                status: 'send'
            },
            where: {
                id: parseInt(req.params.billSaleId)
            }
        })

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/updateStatusToCancel/:billSaleId', async (req, res) => {
    try {
        await prisma.billSale.update({
            data: {
                status: 'cancel'
            },
            where: {
                id: parseInt(req.params.billSaleId)
            }
        })

        res.send({ message: 'success' })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

app.get('/dashboard', async (req, res) => {
    try {
        let arr = [];
        let myDate = new Date();
        let year = myDate.getFullYear();

        for (let i = 1; i <= 12; i++) {
            const daysInMonth = new Date(year, i, 0).getDate();
            const billSaleInMonth = await prisma.billSale.findMany({
                where: {
                    payDate: {
                        gte: new Date(year + '-' + i + '-01'),
                        lte: new Date(year + '-' + i + '-' + daysInMonth)
                    }
                }
            })

            let sumPrice = 0;

            for (let j = 0; j < billSaleInMonth.length; j++) {
                const billSaleObject = billSaleInMonth[j];
                const sum = await prisma.billSaleDetail.aggregate({
                    _sum: {
                        price: true
                    },
                    where: {
                        billSaleId: billSaleObject.id
                    }
                })

                sumPrice = sum._sum.price ?? 0;
            }

            arr.push({ month: i, sumPrice: sumPrice })
        }

        res.send({ results: arr })
    } catch (e) {
        res.status(500).send({ error: e.message });
    }
})

module.exports = app;