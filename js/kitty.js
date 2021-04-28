var contractAddress = "0xFAd4b1eE12F4a2CcD6178f895686AFDB466369E8";

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
        console.log(sessionStorage.getItem("kittyId"));
        getKitty();
    },
};

function getKitty() {
    return DApp.contracts.Kitties.methods.getKitty(sessionStorage.getItem("kittyId")).call().then(kitty => {
        const percentage = parseInt(100 * parseInt(kitty["collected"]) / parseInt(kitty["goal"]), 10)
        
        document.getElementById("detailsKitty").innerHTML = `<small>De ${kitty["user"]["name"]}</small>` +
            `<h1 class="display-5 fw-bold">${kitty["title"]}</h1>` + 
            `<div class="col-lg-6 mx-auto">` + 
            `<p class="lead mb-4">${kitty["description"]}</p>` +
            `</div>` +
            `<div class="row">` + 
            `<div class="col">` +
            `<p class="lead mb-4">Meta: ${kitty["goal"]}</p>` +
            `</div>` +
            `<div class="col">` +
            `<p class="lead mb-4">Arrecadado: ${kitty["collected"]}</p>` +
            `</div>` +
            `</div>` + 
            `<div class='progress'>` + 
            `<div class='progress-bar progress-bar-striped progress-bar-animated bg-success'` + 
            `role='progressbar' aria-valuenow='${kitty["collected"]}' aria-valuemin='0' aria-valuemax='${kitty["goal"]}' style='width: ${percentage}%'></div></div><br/>` +
            `<button type='button' class='btn btn-primary' data-bs-toggle='modal' data-bs-target='#doarVaquinha'>Doar para a vaquinha</button>`
            ;
    });
}

function donate() {
    const value = document.getElementById("value").value;
    let preco = 100000000000000000 * value;
    return DApp.contracts.Kitties.methods.donate(
        sessionStorage.getItem("kittyId")
        ).send(
            { 
                from: DApp.account,
                value: preco
            }
        ).then(
            jQuery("#doarVaquinha").modal("hide")
        );
}

