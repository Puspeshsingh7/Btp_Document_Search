 pragma solidity ^0.5.0;
     pragma experimental ABIEncoderV2;
contract Document_Search{
    
     struct user{
        string username;
        string password;
        
    }
        user[] public users;
       mapping(string => mapping(string => Index_details)) details;
       
    struct Index_details{
     uint flag;
     string key;
     string salt;
     uint size;

   //  mapping(string=>string)Index;
     int[] Bloom;
    }
    
    function Register(string memory username,string memory password) public{
           uint i=findd_id(username);
           if(i==0){
               users.push(user(username,password));
           }
           else{
               revert('The username already exists! ');
           }
                  
    }
    
    function Insert(string memory username,string memory password,string memory doc_name,string memory Key,string memory Salt,uint Size,int [] memory input) public{
        uint i=find_id(username);
         if(keccak256(abi.encodePacked(users[i].password))== keccak256(abi.encodePacked(password)))
         {
          if(details[username][doc_name].flag==0){
 
              Index_details memory p;
              p.flag=1;
              p.key=Key;
              p.salt=Salt;
              p.size=Size;
            /*  string memory k;
              string memory v;
               for(uint i=0;i<input.length;i+=2){
                   k=input[i];
                   v=input[i+1];
                   p.Index[k]=v;
            } */
            p.Bloom=input;
              details[username][doc_name]=p;
          }   
          else{
               revert('The document name for username already exists! ');
          }
         }
         else{
             revert(' Wrong Password for username !');
         }
         
    }
    
    function Search_Keyword(string memory username, string memory doc_name,uint [] memory input)view public returns(int,string memory){
         uint i=find_id(username);
          if(details[username][doc_name].flag!=0){
              int numerator=0;
              int denominator=0;
              //create trigrams and loop
          /*  int h1= hash1(keyword,details[username][doc_name].size);
            int h2=hash2(keyword,details[username][doc_name].size);
            int h3=hash3(keyword,details[username][doc_name].size);
            numerator+=details[username][doc_name].Bloom[h1]+details[username][doc_name].Bloom[h2] +details[username][doc_name].Bloom[h3];
            denominator+=3;
             */
             uint l=details[username][doc_name].size;
             for(uint j=0;j<input.length;j++)
             {
                 if(details[username][doc_name].Bloom[input[j]%l]==1)
                 {
                     numerator++;
                 }
                 denominator++;
             }
            int val=(100*numerator)/denominator;
            if(val>=75)
              return (val,details[username][doc_name].salt);
            else
              return (val,"");
          }   
          else{
               revert('The Document name for username does not exists! ');
          }
         
    }
    
    
     function find_id(string memory username)view internal returns(uint){
            for(uint i=0;i<users.length;i++){
                if(keccak256(abi.encodePacked(users[i].username))== keccak256(abi.encodePacked(username)))
                {
                    return i;
                }
            }
            revert('This username does not exist !');
        }
        
  
    
    function findd_id(string memory username)view internal returns(uint){
             uint k=0;
            for(uint i=0;i<users.length;i++){
                if(keccak256(abi.encodePacked(users[i].username))== keccak256(abi.encodePacked(username)))
                {
                     k=1;
                }
            }
            return k;
           
        }


    
    
    
    
    
    
    
}