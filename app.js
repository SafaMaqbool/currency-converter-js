const BASE_URL =
  "https://v6.exchangerate-api.com/v6/0366c0fcffd273a27a234593/latest/USD";
  //api key= 0366c0fcffd273a27a234593

 
const selectors=document.getElementsByTagName('select')
const btn=document.querySelector('button')
const fromCurrency=document.querySelector('#from')
const toCurrency=document.querySelector('#to')
const msg=document.querySelector('#msg')

// for (code in countryList) {
//     console.log(code)
// }

for (let select of selectors){
    for(currencyCode in countryList){
        let newOption=document.createElement('option');
        newOption.innerText=currencyCode;
        newOption.value=currencyCode;
        if(select.name==="from" && currencyCode==="USD"){
            newOption.selected="selected"
        }
        else if (select.name === "to" && currencyCode === "PKR"){ 
          newOption.selected = "selected";
        }
        select.append(newOption)
    }
    select.addEventListener("change",(evt)=>{
        updateFlag(evt.target)
    })
}

const updateFlag=(element)=>{
    // console.log(element)
    let currencyCode= element.value;
    let countryCode=countryList[currencyCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/32.png`;
    let img=element.parentElement.querySelector('img')  //need to use element bec element se we are targetting
    img.src=newSrc

}

btn.addEventListener("click", async(evt)=>{
    evt.preventDefault();
    let amount = document.querySelector('form input')
    let amount_value = amount.value
    // console.log(amount_value)
    if(amount_value===""||amount_value<1){
        amount_value=1;
        amount.value="1";
    }
    // console.log(fromCurrency.value,toCurrency.value)
    // const URL=`${BASE_URL}/${fromCurrency.value.toLowerCase()}/${toCurrency.value.toLowerCase()}`;
    // console.log("Constructed URL:", URL);
    let response = await fetch(BASE_URL)
    console.log(response)
    let data = await response.json()
    console.log(data);
    // let rate=data[toCurrency.value.toLowerCase()];
    // console.log(rate);

    // let finalAmount=rate *amount_value;
    // msg.innerText=`${amount_value} ${fromCurrency.value} = ${toCurrency.value}`

})

