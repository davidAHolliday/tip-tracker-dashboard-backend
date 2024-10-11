const bodyParser = require("body-parser");
const Transaction = require('../models/transactionModel')

//Functions
 
 const getWeekStartAndEnd = (date) => {
    const givenDate = new Date(date);
    const dayOfWeek = givenDate.getDay();

    const firstDay = new Date(givenDate);
    firstDay.setDate(givenDate.getDate() - dayOfWeek);
    firstDay.setHours(0, 0, 0, 0); // Set to start of the day

    const lastDay = new Date(givenDate);
    lastDay.setDate(givenDate.getDate() + (6 - dayOfWeek));
    lastDay.setHours(23, 59, 59, 999); // Set to end of the day

    return {
        startDayOfWeek: firstDay,
        endOfWeek: lastDay,
    };
};


//Data Connection


//In app colletion, will be replace with mongo
 const inAppDatabase = [
    {
        "timeIn": "2024-10-06T08:00:00.000Z",
        "timeOut": "2024-10-06T16:00:00.000Z",
        "hoursWorked": 8,
        "creditCardTips": 150,
        "tipOut": 50,
        "holliday": false
      },
    {
      "timeIn": "2024-10-07T08:00:00.000Z",
      "timeOut": "2024-10-07T16:00:00.000Z",
      "hoursWorked": 8,
      "creditCardTips": 150,
      "tipOut": 50,
      "holliday": false
    },
    {
      "timeIn": "2024-10-08T09:00:00.000Z",
      "timeOut": "2024-10-08T17:30:00.000Z",
      "hoursWorked": 8.5,
      "creditCardTips": 180,
      "tipOut": 60,
      "holliday": true
    },
    {
        "timeIn": "2024-10-09T09:00:00.000Z",
        "timeOut": "2024-10-09T17:30:00.000Z",
        "hoursWorked": 8.5,
        "creditCardTips": 180,
        "tipOut": 60,
        "holliday": true
      },
      {
        "timeIn": "2024-10-10T09:00:00.000Z",
        "timeOut": "2024-10-10T17:30:00.000Z",
        "hoursWorked": 8.5,
        "creditCardTips": 180,
        "tipOut": 60,
        "holliday": true
      },
    {
      "timeIn": "2024-10-11T10:00:00.000Z",
      "timeOut": "2024-10-11T18:00:00.000Z",
      "hoursWorked": 8,
      "creditCardTips": 200,
      "tipOut": 70,
      "holliday": false
    },
    {
      "timeIn": "2024-10-12T11:00:00.000Z",
      "timeOut": "2024-10-12T19:00:00.000Z",
      "hoursWorked": 8,
      "creditCardTips": 250,
      "tipOut": 80,
      "holliday": true
    }
  ]

 const settings = {
    weeklyGoal:1400,
    startDayOfWeek: 1,
    hourlyRate:5.45,
    overTimeRate:17.5468,
    hollidayRate:15.2500

 }

function processTransactionRequest(timeIn,timeOut,creditCardTips,tipOut,holliday){
    this.timeStamp = new Date();
    this.timeIn = new Date(timeIn);
    this.timeOut = new Date(timeOut);
    this.hoursWorked = (this.timeOut - this.timeIn) / (1000 * 60 * 60)
    this.creditCardTips = creditCardTips;
    this.tipOut = tipOut;
    this.holliday = holliday;
}
 



 //post transactions
 exports.postTransactions = async (req,res)=>{
    const {timeIn,timeOut,creditCardTips,tipOut,holliday} = req.body;
    const {hoursWorked} = new processTransactionRequest(timeIn,timeOut,creditCardTips,tipOut,holliday)

    const transaction = new Transaction({timeIn,timeOut,hoursWorked,creditCardTips,tipOut,holliday})
    try{
        const newTransaction = await transaction.save();
        res.status(201).json(newTransaction);

    }catch(error){
        res.status(400).json({message: error.message});
    }

    }


 //Get transatctions
 exports.getTransactionsByPeriod = async (req, res) => {
    try {
        const requestedDate = req.params.date;
        const { startDayOfWeek, endOfWeek } = getWeekStartAndEnd(requestedDate);

        // If the date parameter is provided
        if (requestedDate) {
            console.log(`Requested Date: ${requestedDate}`);

            // Query MongoDB for transactions within the date range
            const timeWindowedData = await Transaction.find({
                timeIn: {
                    $gte: startDayOfWeek,
                    $lte: endOfWeek
                }
            });

            res.status(200).json(timeWindowedData);
        } else {
            // If no date is provided, return all transactions
            console.log("No date provided, returning all transactions.");
            const allTransactions = await Transaction.find();
            res.status(200).json(allTransactions);
        }
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};




exports.getSummary = async (req, res)=>{
    const date = new Date(); 
    //Create Window for View
    const { startDayOfWeek,endOfWeek,today} = getWeekStartAndEnd(date);

    //filter inAppDateBase
    const timeWindowedData = await Transaction.find({
        timeIn: {
            $gte: startDayOfWeek,
            $lte: endOfWeek
        }
    });


    const summary = timeWindowedData.reduce((acc, curr)=>{
        return {
                creditCardTipsThisPeriod: acc.creditCardTipsThisPeriod + curr.creditCardTips,
                hoursWorkedThisPeriod: acc.hoursWorkedThisPeriod + curr.hoursWorked,
                tipOutThisPeriod: acc.tipOutThisPeriod + curr.tipOut,

        }

    },{ creditCardTipsThisPeriod: 0, hoursWorkedThisPeriod: 0,tipOutThisPeriod:0 })

    const calculateHourlyPay = (hoursWorkedThisPeriod) => {
        let hoursWorked = hoursWorkedThisPeriod;
        let payEarned = 0;
    
        // Calculate overtime pay (for hours over 40)
        if (hoursWorked > 40) {
            const overtimeHours = hoursWorked - 40;
            payEarned += overtimeHours * settings.overTimeRate; // Overtime pay rate
            hoursWorked = 40; // After handling overtime, cap the regular hours at 40
        }
    
        // Calculate regular pay (for hours up to 40)
        payEarned += hoursWorked * settings.hourlyRate; // Regular pay rate
    
        return payEarned;
    };

    //Summary Should Display One Week Pay Period Only
    const summaryDetails = {
            
            summary: summary, 
            avgTipsPerShift: summary.creditCardTipsThisPeriod/inAppDatabase.length,
            avgHourlyRate: (summary.creditCardTipsThisPeriod + calculateHourlyPay(summary.hoursWorkedThisPeriod))/summary.hoursWorkedThisPeriod,
            amountNeededToGoal: 1400 - summary.creditCardTipsThisPeriod,
            daysLeftInWeek: 7 - inAppDatabase.length,
            hourlyPayEarned: calculateHourlyPay(summary.hoursWorkedThisPeriod)
        }

        res.status(200).json(summaryDetails)
    
    }
 