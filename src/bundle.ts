
import { Connection,PublicKey,SystemProgram,Transaction,} from "@solana/web3.js";
import {BN} from "bn.js";
import data from './suteki-mints.json' ;
import data2 from './544ZHb9RNiZbBdfW8TdYMp7tUAbHESs8LtDNR2SVqrC8_mint_accounts.json'

declare global {
    interface Window {
      solana: any;
      solflare:any;
    }
  }

//document elements and constants
const phantom = document.getElementById('Phantom')as HTMLElement;
const Solflare = document.getElementById('Solflare') as HTMLElement;
const return_button = document.querySelector('#quit')as HTMLElement;
const modal = document.querySelector('.modal1')as HTMLElement;
const blob = document.getElementById("blob")as HTMLElement;
const button = document.getElementById('button') as HTMLElement;
const wallet_box = document.querySelector('.public-key-box')as HTMLElement;
const wallet_text = document.querySelector('.public-key-value')as HTMLElement;
const wallet_disconnect = document.querySelector('#disconnect-button')as HTMLElement;
const teki_box = document.querySelector('.image-box')as HTMLElement;
const wep_box = document.querySelector('.weapon-box')as HTMLElement;
const wep_counter = document.querySelector('#weapon-counter')as HTMLElement;
const upgrade_box = document.querySelector('.upgrade-box')as HTMLElement;
const sushi_balance = document.querySelector('#sushi-balance') as HTMLElement;
const sol_balance = document.querySelector('#sol-balance') as HTMLElement;
const info_bar1 = document.querySelector('.info-bar1') as HTMLElement;
const info_bar2 = document.querySelector('.info-bar2') as HTMLElement;
const weapon_image_box = document.querySelector('.upgrade-wep-image-div') as HTMLElement;
const teki_image_box = document.querySelector('.upgrade-image-div') as HTMLElement;

//variables
var balance1:number= 0;
var balance2:number= 0;

var chosen:any = null;
var curr_mint:any = null;
var curr_rank:any = null;
var owner:string = '';
var selected_weapon:string = '';
var wep_count:number = 0;
var wallet_type:string = '';
var all_loaded:boolean = false;


//show custom alert
function showAlert(message:string,color:string) {
    var customAlert = document.querySelector('.custom-alert') as HTMLElement;
    var customAlertMessage = document.querySelector('#custom-alert-message') as HTMLElement;
    
    customAlertMessage.textContent = message;
    customAlert.style.backgroundColor = color == 'teal'? 'teal':'#550505';
    customAlert.style.display = 'block';
    
    setTimeout(function() {
      customAlert.style.display = 'none';
    }, 3000);
}

async function disconnect() {
    try{
      button.style.display = 'none';
      loader.style.display = 'flex';
      wallet_box.style.display = 'none';
      teki_box.style.display = 'none'
      wep_box.style.display = 'none'
      info_bar1.style.display =  'none';
      info_bar2.style.display =  'none';
      upgrade_box.style.display =  'none';
      //main_box.style.display = 'none';
      //info_bar.style.display = 'none';
      //main_box.textContent = '';
      //main_box.innerHTML = '';
      //while (main_box.lastElementChild) {
      //  main_box.removeChild(main_box.lastElementChild);
      //}
      if (wallet_type === 'phantom'){
        await window.solana.disconnect();
      }else{
        await window.solflare.disconnect();
      }
      setTimeout(() => {
        loader.style.display = 'none';
        button.style.display = 'flex';
      }, 3000);
  
  
      showAlert('Wallet disconnected','teal')
    } catch(err){
      //console.log(err);
      showAlert('Error while disconnecting wallet','red')
    }
    
  }

//getting connected wallet sol and sushi balance

async function get_sol_balance(){

    var res:number = 0;
    await fetch('http://192.168.1.43:3000/get_balance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        address: owner,
        })
      })
      .then(response => response.json())
      .then(data => {
        res = data;
        //console.log(data);
      })
      .catch(error => {
        res = 0;
      })
      return res
  }; 
  
async function get_sushi_balance(){

    var res:number = 0;
    await fetch('http://192.168.1.43:3000/get_sushi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        address: owner,
        })
      })
      .then(response => response.json())
      .then(data => {
        res = data
      })
      .catch(error => {
        res = 0;
        // handle errors
      })
      return res
  };

//generic loader
const loader = document.createElement('div');
loader.classList.add('loader');

//blob movement
document.body.onpointermove = event => {
    const {clientX,clientY} = event;
  
    blob!.animate({
      left : `${clientX}px`,
      top : `${clientY}px`,
    },{duration: 1000,fill:"forwards"}
    );
  }


const popupContents = [
  "Refreshing is your best friend!!",
  "Did not get an airdrop? open a ticket in our discord!",
  "Encountered a bug? Notify us in our Discord!",
  "Not sure if your NFT updated? clear cache and keep refreshing!"
];

function showPopup() {
  const randomIndex = Math.floor(Math.random() * popupContents.length);
  const content = popupContents[randomIndex];
  const popup = document.getElementById("popup");
  popup!.querySelector("p")!.textContent = content;
  popup!.style.display = "block";
  setTimeout(function() {
    popup!.style.display = "none";
  }, 10000); // hide popup after 10 seconds
}

setInterval(showPopup, 100000); // show popup every 3 minutes


//getting pub key for phantom wallet
const publicKeyFromBn = (feePayer:any) => {
    const bigNumber = new BN(feePayer._bn, 16)
    const decoded = { _bn: bigNumber };
    return new PublicKey(decoded);
  }

async function connect_wallet(){

    try{
        //phantom check
        if (wallet_type === 'phantom'){
            if (!window.solana || !window.solana.isPhantom) {
                // Phantom is not installed
                //console.log('lmao')
                showAlert('Phantom wallet extension not installed!','red') 
                button.style.display = 'flex' 
                loader.style.display = 'none' 
                return
            }
        }
        
        //solflare check
        if (wallet_type === 'solflare'){
            if (!window.solflare || !window.solflare.isSolflare) {
              // Phantom is not installed
              //console.log('lmao')
              showAlert('Solflare wallet extension not installed!','red') 
              button.style.display = 'flex' 
              loader.style.display = 'none' 
              return
            }
          }

        
        //connecting wallets
        var obj:any = null; 
        if (wallet_type === 'phantom'){
          await window.solana.connect().then((obje:any)=>{
            obj = obje;
            showAlert("Connected to Phantom wallet",'teal');
          });
        }else{
          await window.solflare.connect().then((obje:any)=>{
            owner = window.solflare.publicKey.toString();
            showAlert("Connected to Solflare wallet",'teal');
          });
        }

        loader.style.display = 'none';
        teki_box.style.display = 'flex';
        wep_box.style.display = 'flex';
        upgrade_box.style.display = 'block';
        info_bar1!.style.display = 'block';
        info_bar2!.style.display = 'block';

        if (wallet_type === 'phantom'){
          const key = publicKeyFromBn(obj.publicKey);
          owner = key.toBase58();
        }

        const display_key = owner.substring(0,6)+'...'
        wallet_box.style.display = 'flex';
        wallet_text.textContent = display_key;


        //getting sol and sushi balance
        balance1 = await get_sol_balance()
        balance2 = await get_sushi_balance();
        sol_balance!.textContent = `Balance: ${(balance1 / (1000000000)).toString().substring(0,5)}` 
        sushi_balance!.textContent = `Balance: ${balance2.toString().substring(0,8)}` 

        //getting assets in connected wallet
        let tokenAccounts:any = null;
        const temp = await fetch('http://192.168.1.43:3000/get_tokens_data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            body: JSON.stringify({
              mint: owner//key.toBase58(),
            })
          })
            .then(response => response.json())
            .then(data => {
              tokenAccounts = data
              //console.log(tokenAccounts);
            })
            .catch(error => {
              //console.log(error);
              });

        //suteki and weapons mint list for cross checking      
        const set_data = new Set(data);
        const set2_data = new Set(data2);
        var num:number = 0;

        
        //looping over assets
        for (var cand in tokenAccounts.value){
            const address = (tokenAccounts.value[cand].account.data.parsed['info'].mint);
            const amount =  tokenAccounts.value[cand].account.data.parsed['info'].tokenAmount['amount'];
            if (set_data.has(address) && amount === '1'){
                num+=1
          
                if (num === 1){
                  const size1 = document.createElement('div')
                  size1.setAttribute("id","sizebox-1")
                  teki_box.appendChild(size1)
                }
              
                //fetching required data
                var nft_data:Array<string> = [];
                await fetch('http://192.168.1.43:3000/get_nft_data', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  mode: 'cors',
                  body: JSON.stringify({
                    mint: address,
                    type: 'teki',
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    nft_data = data;              
                  })
                  .catch(error => {
                    // handle errors
                  })

                const img = document.createElement('img');
                const data = document.createElement('div');
                const info_container = document.createElement('div')
                
                
                const placeholder = document.createElement('div')
                placeholder.classList.add('loader-vis');
                wep_box.appendChild(placeholder);

                
                
                img.src = nft_data[2];
                
                img.onload = () => {
                  placeholder.style.display = 'none'
                }
                const rank_data = document.createElement('span')
                data.innerHTML = nft_data[0]+"<br/>";
                rank_data.innerHTML = nft_data[1]
                
                data.appendChild(rank_data);
                
                img.classList.add("nft-image");
                data.classList.add("info");
                info_container.classList.add("info-wrapper");

                if (nft_data[1] != "Henshin"){
                    //console.log('hi')
                    rank_data.style.color = 'red'
                    const lock = document.createElement('img');
                    lock.src = './assets/lock-1.png'
                    lock.classList.add("nft-image")
                    lock.classList.add("lock")
                    info_container.appendChild(lock);
                    info_container.addEventListener('click', async() =>{
                      showAlert('This NFT is not Henshin rank!','red')
                  
                    });
                    info_container.classList.add('invalid');  
                }else{
                const upgrade_ind = document.createElement('div')
                upgrade_ind.innerHTML = 'Ascend';
                upgrade_ind.classList.add('upgrade_ind')
                info_container.appendChild(upgrade_ind);
                info_container.setAttribute('id',address);
                info_container.addEventListener('click',()=>{
                    //choose this NFT for upgrade
                })
                }


                info_container.appendChild(img);

                info_container.appendChild(data);        

                teki_box.appendChild(info_container);

                setTimeout(() => {
                    info_container.style.opacity = '1';
                  }, 10);

            }else if(set2_data.has(address) && amount === '1'){

                wep_count+=1
                wep_counter.textContent = `Weapon Count: ${wep_count}`;
                
                if (wep_count === 1){
                    const size1 = document.createElement('div')
                    size1.setAttribute("id","sizebox-1")
                    wep_box.appendChild(size1)
                  }

                var nft_data:Array<string> = [];
                await fetch('http://192.168.1.43:3000/get_wep_data', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  mode: 'cors',
                  body: JSON.stringify({
                    mint: address,
                    })
                  })
                  .then(response => response.json())
                  .then(data => {
                    nft_data = data;              
                  })
                  .catch(error => {
                    // handle errors
                  })

                  const img = document.createElement('img');
                  const data = document.createElement('div');
                  const info_container = document.createElement('div')
                  
                  
                  const placeholder = document.createElement('div')
                  placeholder.classList.add('loader-vis');
                  teki_box.appendChild(placeholder);

                  img.src = nft_data[2];
                
                  img.onload = () => {
                    placeholder.style.display = 'none'
                  }
                  const rank_data = document.createElement('span')
                  data.innerHTML = nft_data[0]+"<br/>";
                  rank_data.innerHTML = nft_data[1]
                  
                  data.appendChild(rank_data);
                  
                  img.classList.add("nft-image");
                  data.classList.add("info");
                  info_container.classList.add("info-wrapper");

                  const upgrade_ind = document.createElement('div')
                  upgrade_ind.innerHTML = 'Pick';
                  upgrade_ind.classList.add('upgrade_ind')
                  info_container.appendChild(upgrade_ind);
                  info_container.setAttribute('id',address);
                  info_container.addEventListener('click',()=>{
                      //choose this NFT for upgrade
                  })

                  info_container.appendChild(img);
        
                  info_container.appendChild(data);        
        
                  wep_box.appendChild(info_container);
                  setTimeout(() => {
                    info_container.style.opacity = '100';
                  }, 10);

            }

        }



    
    }catch(e:any){
        console.log(e);
        button.style.display = 'flex';
        loader.style.display = 'none';
        showAlert('Failed to connect wallet','red')
    }
    
}




button.addEventListener('click', async() => {
    // Hide the button
    button.style.display = 'none';
    loader.style.display = 'flex';
    
      if ( null === button.parentNode ) {
      throw Error( 'refNode.parentNode is null');
      }
  
    // Add the loading indicator element to the document
    button.parentNode.insertBefore(loader, button.nextSibling);
    setTimeout(() => {
      modal.style.display = 'flex';
    }, 500);

    //await wallet.connect();
});

phantom.addEventListener('click', async() => {
    modal.style.display = 'none';
    wallet_type = 'phantom'
    setTimeout(async function() {
    await connect_wallet();  
    }, 2500);
    
  });
  
Solflare.addEventListener('click', async() => {
    modal.style.display = 'none';
    wallet_type = 'solflare';
    setTimeout(async function() {
      await connect_wallet();  
    }, 2500);
  });

return_button.addEventListener('click', function(e) {

    modal.style.display = 'none';
    button.style.display = 'flex'; 
    loader.style.display = 'none';
    //info_bar.style.display='none';
  });

wallet_disconnect.addEventListener('click', async() =>{
    await disconnect();

  });

weapon_image_box.addEventListener('click',()=>{
    wep_box.scrollIntoView({behavior: 'smooth'});
})
teki_image_box.addEventListener('click',()=>{
    teki_box.scrollIntoView({behavior: 'smooth'});
})