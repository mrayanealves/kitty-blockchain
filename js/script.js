var contractAddress = "0x204e46eec174452C14e316Ce8B58f9FFAe4905Bd";

document.addEventListener("DOMContentLoaded", onDocumentLoad);
function onDocumentLoad() {
    DApp.init();
}

const DApp = {
    web3: null,
    contracts: {},
    account: null,

    init: function () {
        return DApp.initWeb3();
    },

    initWeb3: async function () {
        if (typeof window.ethereum !== "undefined") {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                DApp.account = accounts[0];
                window.ethereum.on('accountsChanged', DApp.updateAccount);
            } catch (error) {
                console.error("Usuário negou acesso ao web3!");
                return;
            }
            DApp.web3 = new Web3(window.ethereum);
        } else {
            console.error("Instalar MetaMask!");
            return;
        }
        return DApp.initContract();
    },

    updateAccount: async function () {
        DApp.account = (await DApp.web3.eth.getAccounts())[0];
    },

    initContract: async function () {
        DApp.contracts.Kitties = new DApp.web3.eth.Contract(abi, contractAddress);
        return DApp.render();
    },

    render: async function () {
        await getAllKitties()
    },
};

function getAllKitties() {
    return DApp.contracts.Kitties.methods.getAllKitties().call().then(kitties => {
        var html = ''
        console.log(kitties)
        if(kitties.length > 0) {
            for(i in kitties) {
                html += 
                `<div class='col-md-4 pb-4'>` + 
                `<div class='card' style='width: 18rem;'>` + 
                `<div class='card-body'>` +
                `<div class='row'>` +
                `<div class='col-md-2'>` +
                `<img src="./img/user.png" class="rounded float-start" width="40" height="40">` +
                `</div>` +
                `<div class='col-md-8'>` +
                `<small class='card-title'>${kitties[i]["user"]["name"]}</small><br>` + 
                `</div>` +
                `</div><br/>` +
                `<h5 class='card-title'>${kitties[i]["title"]}</h5>` + 
                `<p class='card-text'>${kitties[i]["description"]}</p>` + 
                `<small class='card-text'>Meta: ${kitties[i]["goal"]}</small><br/><br/>` + 
                `<button type='button' class='btn btn-primary' onclick='getKitty(${kitties[i]["id"]})'>Doar</button></div></div></div>` +
                `</div>`;

                document.getElementById("allKitties").innerHTML = html
            }
        }
    });
}

function createKitty() {
    const id = Math.floor(Math.random() * 1000000000);  
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    let goal = document.getElementById("goal").value;
    const userName = document.getElementById("userName").value;

    return DApp.contracts.Kitties.methods.createKitty(
        id, 
        title,
        description, 
        goal, 
        userName
    ).send(
        { 
            from: DApp.account,
            gas: 3000000
        }
    ).then(
        jQuery("#createVaquinha").modal("hide")
    );;
}

function getKitty(id) {
    sessionStorage.setItem("kittyId", id);
    location.replace("./kitty.html");
}