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
        console.log(sessionStorage.getItem("kittyId"));
        getKitty();
        isOwner();
    },
};

function getKitty() {
    return DApp.contracts.Kitties.methods.getKitty(sessionStorage.getItem("kittyId")).call().then(kitty => {
        let collected = kitty["collected"]/1000000000000000000;
        let goal = kitty["goal"];
        let percentage = parseInt(collected * 100 / goal);

        document.getElementById("detailsKitty").innerHTML = `<small>De ${kitty["user"]["name"]}</small>` +
        `<h1 class="display-5 fw-bold">${kitty["title"]}</h1>` + 
        `<div class="col-lg-6 mx-auto">` + 
        `<p class="lead mb-4">${kitty["description"]}</p>` +
        `</div>` +
        `<div class="row">` + 
        `<div class="col">` +
        `<p class="lead mb-4">Meta: ${goal}</p>` +
        `</div>` +
        `<div class="col">` +
        `<p class="lead mb-4">Arrecadado: ${collected}</p>` +
        `</div>` +
        `</div>` + 
        `<div class='progress'>` + 
        `<div class='progress-bar progress-bar-striped progress-bar-animated bg-success'` + 
        `role='progressbar' aria-valuenow='${collected}' aria-valuemin='0' aria-valuemax='${goal}' style='width: ${percentage}%'></div></div><br/>`
        ;
    });
}

function isOwner() {
    return DApp.contracts.Kitties.methods.isOwner(sessionStorage.getItem("kittyId")).call({ from : DApp.account }).then(valueIsOwner => {
        console.log(valueIsOwner);
        if(!valueIsOwner) {
            document.getElementById("action").innerHTML = `<button type='button' class='btn btn-primary' data-bs-toggle='modal' data-bs-target='#doarVaquinha'>Doar para a vaquinha</button>`;
        } else {
            document.getElementById("action").innerHTML = `<button type='button' class='btn btn-secondary' onclick='finishKitty()'>Encerrar a vaquinha</button>`;
        }
    });
}

function donate() {
    const value = document.getElementById("value").value;
    let preco = 1000000000000000000 * value;
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

function finishKitty() {
    console.log("chegou aqui");
    return DApp.contracts.Kitties.methods.finishKitty(
        sessionStorage.getItem("kittyId")
        ).send(
            { from: DApp.account}
        );
}

