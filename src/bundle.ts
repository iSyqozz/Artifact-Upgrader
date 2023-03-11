
import { Connection,PublicKey,SystemProgram,Transaction,} from "@solana/web3.js";
import {BN} from "bn.js";
import data from './suteki-mints.json' ;
import data2 from './544ZHb9RNiZbBdfW8TdYMp7tUAbHESs8LtDNR2SVqrC8_mint_accounts.json'
import {animateBlobs,animateText,start_animation,reset} from './jquery_animation';
declare global {
    interface Window {
      solana: any;
      solflare:any;
    }
  }

//document elements and constants
const phantom = document.getElementById('Phantom')as HTMLElement;
const Solflare = document.getElementById('Solflare') as HTMLElement;
const airdrop_counter = document.querySelector('.counter') as HTMLElement;
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
const weapon_image_box = document.querySelector('.upgrade-wep-image-div') as HTMLImageElement;
const teki_image_box = document.querySelector('.upgrade-image-div') as HTMLImageElement;
const clear_selection = document.querySelector('.clear-selection') as HTMLImageElement;
const upgrade_button = document.querySelector('.upgrade-button') as HTMLElement;
const question_mark = document.querySelector('#faq') as HTMLElement;
const airdrop_modal = document.querySelector('.modal3')as HTMLElement;
const quit3 = document.querySelector('#quit3')as HTMLElement;
const choice_modal = document.querySelector('.modal2')as HTMLElement;
const quit2 = document.querySelector('#quit2')as HTMLElement;
const sol_choice = document.querySelector('#pay-sol-button')as HTMLElement;
const sushi_choice = document.querySelector('#pay-sushi-button')as HTMLElement;


//variables
var balance1:number= 0;
var balance2:number= 0;

var chosen:any = null;
var curr_mint:any = null;
var curr_rank:any = null;
var owner:string = '';
var selected_weapon:any = '';
var wep_count:number = 0;
var wallet_type:string = '';
var all_loaded:boolean = false;
var content_intersected:boolean = false;



function display_congrats_message(pic:string){

    const congrats = document.querySelector('.congrats') as HTMLElement;
    const prize = document.querySelector('.prize') as HTMLImageElement;
    const back_glow = document.querySelector('.theSun') as HTMLElement;
    prize.src = pic;
    prize.onload = () => {
      
      congrats!.style.display = 'flex';
      reset();
      start_animation();
      
      prize.style.display = 'block'
      back_glow.style.display = 'block'
      
      setTimeout(() => {
        congrats.style.display = 'none';
        prize.style.display = 'none';
        back_glow.style.display = 'none';
      }, 5000);  

    }
}

function process_name(ele:any){

  ele = ele.lastElementChild;
  var is_digit:boolean = false
  const cands = ['1','2','3','4','5','6','7','8','9','0','#'];
  var res:string = '';
  for (var i = 0; i < ele.textContent.length; i++){
    if (cands.includes(ele.textContent[i])){
      is_digit = true
      res+= ele.textContent[i];
    }else if(!cands.includes(ele.textContent[i]) && !is_digit){
      res+= ele.textContent[i];
    }else if(!cands.includes(ele.textContent[i]) && is_digit){
      break;
    }
  }

  //console.log(res)
  return res 
}

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


const primary_click_event = async ()=>{
  if (all_loaded === false){
    showAlert('Assets are still loading','red')
    return
  }
  choice_modal.style.display = 'flex';
}

function toggle_upgrade_ready(){
  if (selected_weapon === '' || chosen === ''){
    upgrade_button.classList.add('disabled');
    try{
      upgrade_button.removeEventListener('click',primary_click_event);
    }catch(e){}
  }else{
    try{
      upgrade_button.removeEventListener('click',primary_click_event);
    }catch(e){}
    upgrade_button.classList.remove('disabled');
    upgrade_button.addEventListener('click',primary_click_event)
  }
}

function remove_selections(){
    //clearing teki
    teki_image_box.classList.add('upgrade-image-div-placeholder');
    try{
      chosen.classList.remove('curr-chosen');
    }catch(e){}

    chosen = '';
    teki_image_box.src = './assets/base-invis.PNG';
  
    //clearing weapon
    try{
      selected_weapon.classList.remove('curr-chosen');
    }catch(e){}
    selected_weapon = '';
    weapon_image_box.src = './assets/wep_placeholder.png';    
    toggle_upgrade_ready();
  }


function dim(is_transaction:boolean) {
    // show the overlay
    var overlay = document.getElementById('overlay');
    var temp_loader = document.getElementById('temp-loader');
    var hint_text = document.getElementById('hint-text');
    overlay!.style.display = 'block';
    temp_loader!.style.display = 'flex';
    if (is_transaction){
      hint_text!.style.display = 'block';
    }
  }
  
function undim() {
    // show the overlay
    var overlay = document.getElementById('overlay');
    var temp_loader = document.getElementById('temp-loader');
    var hint_text = document.getElementById('hint-text');
    overlay!.style.display = 'none';
    temp_loader!.style.display = 'none';
    hint_text!.style.display = 'none';
  
  }

async function disconnect() {
    try{
      document.getElementById('bottom-sizedbox')!.style.display = 'none';
      button.style.display = 'none';
      loader.style.display = 'flex';
      wallet_box.style.display = 'none';
      teki_box.style.display = 'none'
      wep_box.style.display = 'none'
      info_bar1.style.display =  'none';
      info_bar2.style.display =  'none';
      upgrade_box.style.display =  'none';
      teki_box.innerHTML = '';
      wep_box.innerHTML = '';
      wep_count = 0;
      remove_selections();
      while (teki_box.lastElementChild) {
        teki_box.removeChild(teki_box.lastElementChild);
      }
      while (wep_box.lastElementChild) {
        wep_box.removeChild(wep_box.lastElementChild);
      }

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

  async function get_airdrops(){

    var res:number = 0;
    await fetch('http://192.168.1.43:3000/get_airdrop_weapons', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      })
      .then(response => response.json())
      .then(data => {
        //console.log('weapons:')
        //console.log(data)
        res =  data
      })
      .catch(error => {
        //console.log(error)
      })
    return res;
  }

get_airdrops().then(data => {airdrop_counter.innerHTML = `Airdrops Left: ${data}`;})


async function upgrade_henshin(is_sol:boolean) {
  try{
  const teki_mint_address = chosen.getAttribute('id');
  const wep_mint_address = selected_weapon.getAttribute('id');
  var hash_data:any = null;
  var airdropped:string = '';

  await fetch('http://192.168.1.43:3000/get_hash_info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors',
  })
  .then(response => response.json())
  .then(data =>{
    hash_data = data 
  })
  //console.log(hash_data);
  dim(true);
  
  //Sol option
  if (is_sol){
    await fetch('http://192.168.1.43:3000/get_artifact_sol_transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body:JSON.stringify({
        owner_address:owner,
        wep:wep_mint_address,
        wallet:wallet_type,
      })
    })
    .then(response => response.json())
    .then(async data =>{
      const transactionBuffer = Buffer.from(data, 'base64');
      const tx = Transaction.from(transactionBuffer);


      if (wallet_type === 'phantom'){

        var sig:any = null;
        sig = await window.solana.signAndSendTransaction(tx,{skipPreflight: false});
        }else{   
        const signed = await window.solflare.signTransaction(tx);
        const temp = signed.serialize({requireAllSignatures:true,verifySignatures:true})
        const transactionBase64 = Buffer.from(temp).toString('base64'); 
        await fetch('http://192.168.1.43:3000/submit_solflare_transaction',{
          method:"POST",
          headers:{
            'Content-Type': 'application/json'
            },
            body:JSON.stringify({
              serialized_transaction:transactionBase64 
            }),
        })
        .then(response => response.json())
        .then(data =>{
          sig = data
        })}

        const teki_name = process_name(chosen);
        const wep_name = process_name(selected_weapon);


        var status_data:string = 'succeeded'; 
        await fetch('http://192.168.1.43:3000/check_artifact_transaction',{
          method:'POST',
          headers:{
          'Content-Type': 'application/json'
          },
          body:JSON.stringify({
            signature: wallet_type === 'phantom'?sig.signature:sig,
            mint:teki_mint_address,
            wep_mint:wep_mint_address,
            sol: true,
            teki_name:teki_name,
            wep_name:wep_name,
          }),
        })
        .then(response => response.json())
        .then(data => {
          //console.log(data);
          try{
            console.log(data)
            status_data = data[0];
            airdropped = data[1];
          }catch(e){
            status_data = 'failed';
          }
        })

        if (status_data != 'succeeded'){
          showAlert('Failed to finalize transaction','red');
          undim();
        }else{
          //console.log(wallet_type === 'phantom'?sig.signature:sig)
          showAlert('Successfully confirmed transaction','teal');
          choice_modal.style.display = 'none';

          //console.log(airdropped);
          
          if (airdropped != ''){
            display_congrats_message(airdropped);
          }

          try{
          setTimeout(() => {
              selected_weapon.remove()
              chosen.remove()      
              remove_selections();
              wep_count -=1;
              wep_counter.textContent = `Weapon Count: ${wep_count}`;
            }, 300);
                        
          setTimeout(async () => {
              balance1 = await get_sol_balance();
              sol_balance!.textContent = `Balance: ${(balance1 / (1000000000)).toString().substring(0,5)}`;
            
            }, 30000);

          }catch(e){
            console.log(e);
            }
          undim();
          }
      })

  
  //Sushi option
  }else{

    await fetch('http://192.168.1.43:3000/get_artifact_sushi_transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body:JSON.stringify({
        owner_address:owner,
        wep:wep_mint_address,
        wallet:wallet_type,
      })
    })
    .then(response => response.json())
    .then(async data =>{
      const transactionBuffer = Buffer.from(data, 'base64');
      const tx = Transaction.from(transactionBuffer);


      if (wallet_type === 'phantom'){

        var sig:any = null;
        sig = await window.solana.signAndSendTransaction(tx,{skipPreflight: false});
        }else{   
        const signed = await window.solflare.signTransaction(tx);
        const temp = signed.serialize({requireAllSignatures:true,verifySignatures:true})
        const transactionBase64 = Buffer.from(temp).toString('base64'); 
        await fetch('http://192.168.1.43:3000/submit_solflare_transaction',{
          method:"POST",
          headers:{
            'Content-Type': 'application/json'
            },
            body:JSON.stringify({
              serialized_transaction:transactionBase64 
            }),
        })
        .then(response => response.json())
        .then(data =>{
          sig = data
        })}

        const teki_name = process_name(chosen);
        const wep_name = process_name(selected_weapon);

        var status_data:string = 'succeeded'; 
        await fetch('http://192.168.1.43:3000/check_artifact_transaction',{
          method:'POST',
          headers:{
          'Content-Type': 'application/json'
          },
          body:JSON.stringify({
            signature: wallet_type === 'phantom'?sig.signature:sig,
            mint:teki_mint_address,
            wep_mint:wep_mint_address,
            sol: false,
            teki_name:teki_name,
            wep_name:wep_name,
          }),
        })
        .then(response => response.json())
        .then(data => {
          //console.log(data);
          try{
            status_data = data[0];
            airdropped = data[1];
          }catch(e){
            status_data = 'failed';
          }
        })

        if (status_data != 'succeeded'){
          showAlert('Failed to finalize transaction','red');
          undim();
        }else{
          //console.log(wallet_type === 'phantom'?sig.signature:sig)
          showAlert('Successfully confirmed transaction','teal');
          choice_modal.style.display = 'none';

          //console.log(airdropped);

          try{
          setTimeout(() => {
              selected_weapon.remove()
              chosen.remove()      
              remove_selections();
              wep_count -=1;
              wep_counter.textContent = `Weapon Count: ${wep_count}`;
            }, 300);
                        
          setTimeout(async () => {
              balance2 = await get_sushi_balance();
              sushi_balance!.textContent = `Balance: ${balance2.toString().substring(0,8)}` 
            }, 30000);

          }catch(e){
            console.log(e);
            }
          undim();
          }
      })
  }
  

  
  }catch(e){
    undim();
    showAlert('Failed to finalize transaction','red');
    console.log(e);
  }
}

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

  while (teki_box.lastElementChild) {
    teki_box.removeChild(teki_box.lastElementChild);
  }
  while (wep_box.lastElementChild) {
    wep_box.removeChild(wep_box.lastElementChild);
  }

  document.getElementById('bottom-sizedbox')!.style.display = 'block';

  setInterval(()=>{
    //console.log(window.navigator.onLine);
    if (!window.navigator.onLine){
      location.reload();
    }
  },5000)

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
        balance1 = await get_sol_balance();
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
                  try{
                    chosen.classList.remove('curr-chosen');
                  }catch(e){}
                  teki_image_box.classList.remove('upgrade-image-div-placeholder');

                  chosen = info_container;
                  chosen.classList.add('curr-chosen');

                  teki_image_box.src = `${img.src}`;
                  wep_box.scrollIntoView({behavior:'smooth'});
                  toggle_upgrade_ready();
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

                  const upgrade_ind = document.createElement('div')
                  upgrade_ind.innerHTML = 'Pick';
                  upgrade_ind.classList.add('upgrade_ind')
                  info_container.appendChild(upgrade_ind);
                  info_container.setAttribute('id',address);
                  info_container.addEventListener('click',()=>{
                    
                    //choose this NFT for upgrade
                  try{
                    selected_weapon.classList.remove('curr-chosen');
                  }catch(e){}
                  selected_weapon = info_container;
                  selected_weapon.classList.add('curr-chosen');
                  
                  weapon_image_box.src = `${img.src}`;
                  upgrade_box.scrollIntoView({behavior:'smooth'});
                  toggle_upgrade_ready();
                  })

                  info_container.appendChild(img);
        
                  info_container.appendChild(data);        
        
                  wep_box.appendChild(info_container);
                  setTimeout(() => {
                    info_container.style.opacity = '100';
                 }, 10);
            }
        }
    all_loaded = true;
    }catch(e:any){
        console.log(e);
        button.style.display = 'flex';
        loader.style.display = 'none';
        showAlert('Failed to connect wallet','red');
        setTimeout(() => {
          location.reload();
        }, 2000);
    }
}

//event listeners

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
});
teki_image_box.addEventListener('click',()=>{
    teki_box.scrollIntoView({behavior: 'smooth'});
});
clear_selection.addEventListener('click',()=>{
  remove_selections();
});

question_mark.addEventListener('click',async() => {
  dim(false);
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    undim();
    airdrop_modal.style.display = 'flex'
}, 1000)});

quit3.addEventListener('click',()=>{
  airdrop_modal.style.display= 'none';
  document.body.style.overflow = 'auto';
  });

window.addEventListener("scroll", function() {
  if (window.scrollY >= 70 && !content_intersected) {

    //console.log('toggled');
    document.querySelector('.title')!.classList.toggle("scrolled-to-content");
    airdrop_counter.classList.toggle("scrolled-to-content");
    document.querySelector('.public-key-box')!.classList.toggle("scrolled-to-content");
    question_mark.classList.toggle("scrolled-to-content");
    content_intersected = true;  

    }else if(window.scrollY < 70 && content_intersected){

    //console.log('toggled');
    document.querySelector('.title')!.classList.toggle("scrolled-to-content");
    airdrop_counter.classList.toggle("scrolled-to-content");
    document.querySelector('.public-key-box')!.classList.toggle("scrolled-to-content");
    question_mark.classList.toggle("scrolled-to-content");
    content_intersected = false;  
    }
  })

sol_choice.addEventListener('click', async function(e){
  upgrade_henshin(true);
  })
    
sushi_choice.addEventListener('click',async function(e){
  upgrade_henshin(false);
  })


quit2.addEventListener('click', function(e) {
    choice_modal.style.display = 'none'
    //console.log(chosen);
  });


