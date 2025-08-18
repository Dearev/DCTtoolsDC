document.getElementById('auctionForm').onsubmit = function(e) {
    e.preventDefault();

    const plot = document.getElementById('plot').value.trim();
    const resellPriceStr = document.getElementById('resell_price').value.trim();
    const minIncrease = document.getElementById('min_increase').value.trim();

    const errorDiv = document.getElementById('error');
    const resultDiv = document.getElementById('result');
    const copyBtn = document.getElementById('copyBtn');

    errorDiv.textContent = "";
    resultDiv.style.display = "none";
    copyBtn.style.display = "none";

    if (!plot || !resellPriceStr) {
        errorDiv.textContent = "Plot and Resell Price are required.";
        return;
    }

    let resellPrice, startingBid;
    try {
        resellPrice = parseFloat(resellPriceStr);
        if (isNaN(resellPrice)) throw "NaN";
        startingBid = Math.round(resellPrice/2);
    } catch {
        errorDiv.textContent = "Resell Price must be a number.";
        return;
    }

    const minInc = minIncrease === "" ? "1000" : minIncrease;

    const template = `${plot} -- EVICTION AUCTION
🪙 **Starting Bid:** ${startingBid}
-# This is the price of the first eligible bid.

📈 **Minimum Increase:** ${minInc}
-# You must bid at least this number higher than the last eligible bid!

🕙  **Auction Ends:** 24 hours after last bid.
-# You must bid within this time after the last eligible bid!

🏛️  **Auction Levy**
-# Do you own a property portfolio? If you own over a certain amount of plots, you need to pay a levy. This levy is designed to give less-established players an opportunity to enter the market.

> 0-9 plots → You pay 0% of your bid extra
>
> 10-14 plots → You pay 25% of your bid extra
>
> 15-20 plots → You pay 50% of your bid extra
>
> 20+ plots → You pay 75% of your bid extra

🚩 **Significant fines apply:** Misrepresenting or failing to include your fairness fee may constitute an offence.

> Bids by players who own enough plots to warrant an auction levy must include the amount of tax that would be paid if the bid is successful.
>
> Bidders are responsible for calculating this, and must include the levy amount in their bid message as a separate amount from the amount they are bidding.
>
> Any bid not including the levy amount (when applicable) or including a miscalculated amount is to be considered invalid.
>
> If a winning bidder cannot pay the levy, a new auction will be held, and the bidder will also face Auction Levy Neglect charges if the plot is subject to an Auction levy.
>
> Taking actions with the sole intent to avoid paying a fairness fee while still receiving the plot or the benefit from it may result in fines, plot eviction and ban from eviction auctions for up to two weeks.

🙋‍♂️ **Making a Bid**
We recommend the following template for bidding!
-# Change to suit!

Bid: $0 (bank/balance)
Levy: $0 (0%)

**Lets start the bidding!**
-# By participating in an auction, you agree to the terms of, and to be bound to, the Department's Auction Policy. [Read Here](https://www.democracycraft.net/threads/auction-policy.17176/)
`;

    resultDiv.textContent = template;
    resultDiv.style.display = "block";
    copyBtn.style.display = "inline-block";

    copyBtn.onclick = function() {
        navigator.clipboard.writeText(template).then(() => {
            copyBtn.textContent = "Copied!";
            setTimeout(() => { copyBtn.textContent = "Copy to Clipboard"; }, 2000);
        });
    };
};