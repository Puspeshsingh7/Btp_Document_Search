import Web3 from 'web3';
import Document_Search from '../build/contracts/Document_Search.json';

let web3;
let crud;


const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if(typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if(typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
  });
};

const initContract = () => {
    const deploymentKey = Object.keys(Document_Search.networks)[0];
  return new web3.eth.Contract(
    Document_Search.abi, 
    Document_Search
      .networks[deploymentKey]
      .address
  );
};



const initApp = () => {

    const $Register = document.getElementById('Register');
    const $RegisterResult = document.getElementById('Register-result');
    const $Insert_Document_Details = document.getElementById('Insert_Document_Details');
    const $Insert_Document_DetailsResult = document.getElementById('Insert_Document_Details-result');
    const $Search_Keyword = document.getElementById('Search_Keyword');
    const $Search_KeywordResult = document.getElementById('Search_Keyword-result');
  let accounts = [];

  web3.eth.getAccounts()
  .then(_accounts => {
    accounts = _accounts;
  });

    $Register.addEventListener('submit', (e) => {
    e.preventDefault();
        const username = e.target.elements[0].value;
        const password = e.target.elements[1].value;

        var flag=1;
        var res="abc";
        var msg = username+password;

        const prefix = "\x19Ethereum signed message:\n" + msg

        web3.eth.sign(prefix, accounts[0]).then(result => {
          // res=result;
})
        .catch(_e => {
          //  flag=0;
            $RegisterResult.innerHTML = `Ooops... there was an error while trying to sign transaction for  registering user ${username}`;

        });

        crud.methods.Register(username,password).send({from: accounts[0]})
    .then(result => {
      $RegisterResult.innerHTML = `New user ${username} registered successfully `;
    })
    .catch(_e => {
      $RegisterResult.innerHTML = `Ooops... their was an error while trying to register username ${username}`;
    });
  });

  $Insert_Document_Details.addEventListener('submit', (e) => {
    e.preventDefault();
        const username = e.target.elements[0].value;
        const password = e.target.elements[1].value;
        const Docname= e.target.elements[2].value;
        const key= e.target.elements[3].value;
        const Salt= e.target.elements[4].value;
        const Size= e.target.elements[5].value;
        const bloom= e.target.elements[6].value;

        const brr=[];
        var j=0;
        var start=0;
       for (var i = 0; i < bloom.length; i++) {
         if(bloom[i]==",")
          {
             brr[j]=bloom.substring(start, i);;
             j++;
            start=i+1;
          }
        }
        if(start< bloom.length)
        brr[j]=bloom.substring(start);

       const arr=[];
       for (var i = 0; i < brr.length; i++) {
          arr[i]=brr[i]-'0';
        }

        var flag=1;
        var res="abc";
        var msg = username+password+Docname+key+bloom;

        const prefix = "\x19Ethereum signed message:\n" + msg

        web3.eth.sign(prefix, accounts[0]).then(result => {
           res=result;
})
        .catch(_e => {
            flag=0;
            $Insert_Document_DetailsResult.innerHTML = `Ooops... there was an error while trying to sign transaction for  Inserting Document details for ${Docname}`;

        });

        crud.methods.Insert(username,password,Docname,key,Salt,Size,arr).send({from: accounts[0]})
    .then(result => {
      $Insert_Document_DetailsResult.innerHTML = `New Document ${Docname}  details stored  successfully `;
    })
    .catch(_e => {
      $Insert_Document_DetailsResult.innerHTML = `Ooops... there was an error while trying to store deatils for ${Docname}`;
    });
  });




 

    $Search_Keyword.addEventListener('submit', (e) => {
    e.preventDefault();
        const username = e.target.elements[0].value;
        const Docname = e.target.elements[1].value;
        const keyword = e.target.elements[2].value;


        function Create_Trigrams(a) {
          const str=[];
          var j=0;
          for (var i = 0; i+2 < a.length; i++) {
         
                str[j]=a.substring(i, i+3);
                j++;
           }
           if(a.length==1)
           {
             str[j]=a+a+a;
           }
           else{
            const  l=a.length;
             str[j]=a[l-2]+a[l-1]+a[0];
             str[j+1]=a[l-1]+a[0]+a[1];
           }
          return str;
           }
         
           // hash 1
           function h1(s)
         {
             var hash = 0;
             for (var i = 0; i < s.length; i++)
             {
                 hash = hash + s.charCodeAt(i) ;
               //  hash = hash % arrSize;
             }
             return hash;
         }
         
         function h2(s)
         {
             var hash = 1;
             for (var i = 0; i < s.length; i++)
             {
                 hash = hash + (Math.pow(19,i))*s.charCodeAt(i);
               //  hash = hash % arrSize;
             }
             return hash;
         }
         
         function h3(s)
         {
             var hash = 7;
             for (var i = 0; i < s.length; i++)
             {
                 hash = hash * 31 + s.charCodeAt(i) ;
               //  hash = hash % arrSize;
             }
             return hash;
         }
         
           function Create_Bloom(str) {
             const arr=[];
             var j=0;
             for (var i = 0; i < str.length; i++) {
         
               arr[j]=h1(str[i]);
               j++;
               arr[j]=h2(str[i]);
               j++;
               arr[j]=h3(str[i]);
               j++;
          }
         return arr;
           }
         
         
        // keyword="abcdef";
        const s=Create_Trigrams(keyword);
          // console.log(s);
        const arr=Create_Bloom(s);
          // console.log(arr);

        crud.methods.Search_Keyword(username,Docname,arr).call()
    .then(result => {
 
      $Search_KeywordResult.innerHTML = `Note-> Salt apperas only if match probability is >=75 % .The Keyword matched with probability ${result[0]} % , The salt of Document is  ${result[1]}`;
    })
    .catch(_e => {
      $Search_KeywordResult.innerHTML = `Ooops... there was an error while trying to fetch Salt for username ${username},Docname ${Docname}, keyword ${keyword}`;
    });
  });

    
};


document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      crud = initContract();
      initApp(); 
    })
        .catch(e => console.log(e.message));
   
});