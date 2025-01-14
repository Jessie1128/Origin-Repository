// =========================================================== getElementsBy ClassName & Id function
el = (className,num=0) => { 
    return document.getElementsByClassName(className)[num];
}

el_id = (idName) => {
    return document.getElementById(idName);
}

// =========================================================== 重新導向到首頁

go_to_homePage = () => {
    window.location.href="/";
}

go_to_bookingPage = () => {
    window.location.href="/booking";
}
// =========================================================== 
indexPage = (page) => {
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();
    let url=`/api/attractions?page=${page}`;
    fetchUrl(url);
};

select = () => {
    textInput = document.getElementById("header_input").value;
    if (textInput==''){
        alert("請輸入文字");
    }else{
        let url=`/api/attractions?keyword=${textInput}`;
        fetchUrl(url);
    }
};

attractionPage = () =>{                         
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();  
    single_attraction_id();                  
    price_click_eventListener(); 
}

bookingPage = () => {
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();
    check_booking_info();
}

thank_you_page = () => {
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();
    check_order_info();
}

// =========================================================== nav 的 eventlistener 

nav_eventListener = () =>{
    el("nav_left").addEventListener("click",go_to_homePage);
    el("nav_right_item",1).addEventListener("click",login_show);
    el_id("login_botton").addEventListener("click",dircet_to_login_system);
} 

// =========================================================== 取得單一景點資訊的 fetch api & right_bottom_botton 的註冊事件

single_attraction_id = () => {
    let id=location.pathname;
    id=id.substring(id.lastIndexOf("/")+1);
    fetch(`/api/attraction/${id}`)
    .then(res=>res.json())
    .then((data)=>{
        let pic=data.data["images"];
        let name=data.data["name"];
        let mrt=data.data["mrt"];
        let cat=data.data["category"];
        let des=data.data["description"]
        let address=data.data["address"];
        let trans=data.data["transport"];
        document.getElementsByClassName("attraction_name")[0].textContent=name;
        document.getElementsByClassName("attraction_loca")[0].textContent=`${cat} at ${mrt}`;
        document.getElementsByTagName('p')[5].textContent=des;
        document.getElementsByTagName('p')[7].textContent=address;
        document.getElementsByTagName('p')[9].textContent=trans;
        slider(pic);
    })
    el("right_bottom_botton").addEventListener("click",attraction_reserve); 
}


// =========================================================== 景點的預定行程的 eventlistener & 跳轉到booking頁面

attraction_reserve = () => {
    if(el("nav_right_item",1).innerText=="登陸/註冊"){     
        el("body_cover").style.display="block";
        el("nav").style.filter="brightness(0.75)";
        el("login_box").style.display="block";      
    }else{
        console.log("登陸了")
        booking();
    }
}

// =========================================================== 按鈕：開始預定行程 的 api
booking = () => {
    let info={};
    let id=location.pathname;
    let time;
    if(el("right_bottom_span2").innerText=="新台幣 2000 元"){
        price="2000";
        time="morning";
    }else{
        price="2500";
        time="afternoon";
    }
    info["attractionId"]=id.substring(id.lastIndexOf("/")+1);
    info["date"]=el_id("date").value;
    info["price"]=price;
    info["time"]=time;
    url="/api/booking";
    fetch(url,{                     // ========================================= fetch
        method: "POST",
        body: JSON.stringify(info),
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then(res=>res.json())
    .then((data)=>{
        console.log(data)
        if (data["error"]==true & data["message"]=="建立失敗，輸入不正確或其他原因"){
            error_box_show();
            el("error_box_inner_stitle").textContent="'選擇日期' 欄位輸入不正確";
            //==================================================================== 取得今天日期
            let today=new Date().toISOString().split('T')[0];    
            if (info["date"] == ''){
                el("error_box_inner_text").textContent="日期欄位不得為空";
                el("error_box").style.height="100px";
            }else if(info["date"]<=today){
                el("error_box_inner_text").textContent="'選擇日期' 欄位，\n請選擇今天以後的日期";
                el("error_box").style.height="116px";
            }
            error_box_close();           
        }else{
            go_to_bookingPage();
        }
    })
    
}

// =========================================================== bookingPage 載入後的 行程確認 api
check_booking_info = () => {
    let url="/api/booking";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        if(data["error"]==true){
            go_to_homePage();
        }else if(data["data"]==null){
            booking_page_no_info();
        }else{
            let time;
            if (data.data["time"]=="morning"){
                time="上午時段";
            }else{
                time="下午時段";
            }
            booking_page_create_info(data,time);
        }
    })
}

// =========================================================== thankyouPage 載入後的 訂單確認 api

check_order_info = () => {
    let order_num=location.href;
    order_num=order_num.substring(order_num.lastIndexOf("=")+1);
    let url=`/api/orders?number=${order_num}`;
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        if(data["error"]==true){
            go_to_homePage();
        }else if(data["data"]==null){
            go_to_homePage();
        }else{  
            console.log(data);
            thankyou_page_inner(data);
        }
    })
}

thankyou_page_inner = (data) => {
    el("main_inner_text_head").textContent="行程預定成功";
    el("main_inner_text_head",1).textContent="您的訂單您的訂單編號如下：";
    el("booking_order_num").innerHTML="訂單編號：<div class='booking_order_num_div'>"+data["data"]["number"]+"</div>";
    el("main_inner_text_ps").textContent="請記住此編號，或到會員中心查詢歷史訂單";
    total_height=el("nav").offsetHeight+el("main_inner").offsetHeight;
    el("footer").style.height="calc(100vh - "+total_height+"px)";
}
// =========================================================== 處理 booking頁面 畫面

booking_page_no_info = () => {
    if(el("headline_2") != undefined){
        el("headline_2").remove();
        el("contact").remove();
        el("payment").remove();
        el("confirm").remove();
        hr=document.querySelectorAll(".hr");
        hr.forEach(elem=>elem.remove());
    }
    el("headline_main_top").innerHTML="您好，<span class='headline_main_name'></span>待預定的行程如下：";
    headline_1=document.createElement("div");
    headline_1.className="headline_1";
    headline_1_inner=document.createElement("div");
    headline_1_inner.className="headline_1_inner";
    headline_1_inner.textContent="目前沒有任何待預訂的行程";
    headline_1.appendChild(headline_1_inner);
    document.body.insertBefore(headline_1,el("footer"));
    total_height=el("nav").offsetHeight+el("headline_main").offsetHeight+el("headline_1").offsetHeight;
    el("footer").style.height="calc(100vh - "+total_height+"px)";
    let url="/api/user";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        el("headline_main_name").textContent=data["data"]["name"]+'，';
    })
}


booking_page_create_info = (data,time) => {
    // =========================================================== create headline_2
    el("headline_main_top").innerHTML="您好，<span class='headline_main_name'></span>待預定的行程如下：";
    img=document.createElement("img");
    img.className="headline_2_left";
    img.setAttribute("src",data["data"]["attraction"]["image"]);
    el("headline_2_inner").insertBefore(img,el("headline_2_right"));
    el("headline_2_right_stitle").textContent="台北一日遊：";
    el_id("headline_2_name").textContent=data["data"]["attraction"]["name"];
    el("remove_booking").setAttribute("src","icon_delete.png")
    el_id("date").innerHTML="日期：<span id='headline_2_date'>"+data["data"]["date"]+"</span>";
    el_id("time").innerHTML="時間：<span id='headline_2_time'>"+time+"</span>";
    el_id("price").innerHTML="費用：<span id='headline_2_price'>"+data["data"]["price"]+"</span>";
    el_id("address").innerHTML="地點：<span id='headline_2_address'>"+data["data"]["attraction"]["address"]+"</span>";
    hr=document.createElement("hr");
    hr.className="hr";
    document.body.insertBefore(hr,el("contact"));
    // =========================================================== create contact
    el_id("contact_stitle").textContent="您的聯絡資訊";
    el_id("contact_name").innerHTML="聯絡姓名：<input class='contact_input' type='text' name='contact_name'>";
    el_id("contact_email").innerHTML="聯絡信箱：<input class='contact_input' type='text' name='contact_mail'>";
    el_id("contact_phone").innerHTML="手機號碼：<input class='contact_input' type='text' name='contact_phone'>";
    el_id("contact_notice").textContent="請保持手機暢通，準時到達，導覽人員將用手機與您聯繫，務必留下正確的聯絡方式。";
    hr=document.createElement("hr");
    hr.className="hr";
    document.body.insertBefore(hr,el("payment"));
    // =========================================================== create payment
    el_id("payment_stitle").textContent="信用卡付款資訊";
    // el_id("payment_num").innerHTML="卡片號碼：<input class='payment_input' placeholder='**** **** **** ****' type='text' name='contact_name'>";
    // el_id("payment_expire_date").innerHTML="過期時間：<input class='payment_input' placeholder='MM / YY' type='text' name='contact_mail'>";
    // el_id("payment_cvv").innerHTML="驗證密碼：<input class='payment_input' placeholder='CVV' type='text' name='contact_phone'>";
    el_id("payment_1").innerHTML="卡片號碼：<div class='payment_input' id='card-number'></div>";
    el_id("payment_2").innerHTML="過期時間：<div class='payment_input' id='card-expiration-date'></div>";
    el_id("payment_3").innerHTML="驗證密碼：<div class='payment_input' id='card-ccv'></div>";
    for_TapPay();
    hr=document.createElement("hr");
    hr.className="hr";
    document.body.insertBefore(hr,el("confirm"));
    // =========================================================== create confirm
    el("confirm_price").innerHTML="總價：<div class='confirm_price_inner'></div>";
    el("confirm_price_inner").textContent="新台幣 "+data["data"]["price"]+" 元";
    botton=document.createElement("botton");
    botton.className="confirm_botton";
    botton.textContent="確認訂購並付款";
    el("confirm").appendChild(botton);
    // =========================================================== remove_booking & confirm botton addEventListener
    el("remove_booking").addEventListener("click",remove_booking.bind(null,data["data"]["attraction"]["id"]));
    // el("confirm_botton").addEventListener("click",confirm_order.bind(null,data));
    el("confirm_botton").addEventListener("click",TPDirect_card_getPrime.bind(null,data));
    // =========================================================== booking頁面 '自動填入使用者資料'
    let url="/api/user";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        el("headline_main_name").textContent=data["data"]["name"]+'，';
        el("contact_input").value=data["data"]["name"];
        el("contact_input",1).value=data["data"]["email"];
    })
}


// =========================================================== 檢查使用者是否登陸 和 登出系統標示 和 nav的預定行程的 eventlistener
// var user;
check_user_status = () => {
    let current_page=location.href;
    let url="/api/user";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        if (data["data"]==null){
            console.log("還沒登陸或是token錯誤")
            // ================ for 預定行程
            el("nav_right_item").addEventListener("click",login_show);   
            // ================ for thankyou Page
            // if (current_page.substring(current_page.lastIndexOf("/")+1)=="thankyou"){
            //     go_to_homePage(); 
            // }else if (current_page.substring(current_page.lastIndexOf("/")+1,current_page.indexOf('?'))=="thankyou"){
            //     go_to_homePage(); 
            // }
            // ================ for thankyou Page
        }else if(data.data["id"]!=null & data.data["name"]!=null & data.data["email"]!=null){
            // ================ for 登入登出
            el("nav_right_item",1).textContent="登出系統";        
            el("login_box").style.display="none";
             // ================ for 預定行程
            el("nav_right_item").addEventListener("click",go_to_bookingPage);    
            // ================ for thankyou Page
            // if (current_page.substring(current_page.lastIndexOf("/")+1)=="thankyou"){
            //     go_to_homePage(); 
            // }else if (current_page.substring(current_page.lastIndexOf("/")+1,current_page.indexOf('?'))=="thankyou"){
            //     el("nav_right_item").addEventListener("click",go_to_bookingPage);  
            // }
            // ================ for thankyou Page
        }
    })
}

// =========================================================== 刪除預定的點擊鈕

remove_booking = (id,click) => {
    console.log(click);
    console.log("我要刪掉",id);
    let url="/api/booking";
    fetch(url,{                    
        method: "DELETE",
        body: JSON.stringify({"id":id}),
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then(res=>res.json())
    .then((data)=>{
        //======================= for 付款完成刪掉購物車
        if(data["ok"]==true & click===undefined){
            return;
        //======================= for 刪除預定行程按鈕
        }else{
            go_to_bookingPage();
        }
    })
}

// =========================================================== booking頁面 沒有預定行程的處理

no_booking = () =>{
    el("headline_2").style.display="none";
    el("contact").style.display="none";
    el("payment").style.display="none";
    el("confirm").style.display="none";
    hr=document.querySelectorAll(".hr");
    hr.forEach(elem=>elem.style.display="none");
};

// =========================================================== 錯誤框 跳出 關閉

error_box_show = () =>{
    el("body_cover").style.display="flex";
    el("error_box").style.display="flex";
    el("nav").style.filter="brightness(0.75)";
}

error_box_close = () => {
    el_id("close_error_box").addEventListener("click",()=>{
        el("body_cover").style.display="none";
        el("error_box").style.display="none";
        el("nav").style.filter="brightness(1.0)";
    })
}


// =========================================================== TapPay


for_TapPay = () =>{
    let fields = {
        number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: '#card-expiration-date',
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'ccv'
        }
    }
    
    TPDirect.card.setup({
        fields: fields,
        styles: {
            'input': {
                'color': 'gray'
            },
            ':focus': {
                'color': 'black'
            },
            '.valid': {
                'color': ' #448899'
            },
            '.invalid': {
                'color': '#c55326e7'
            },
        }
    })
    
    TPDirect.card.onUpdate(function (update) {
        console.log(update.canGetPrime);
        // if (update.canGetPrime) {
        //     console.log("資料完整,Enable submit Button to get prime");
        // } else {
        //     console.log("資料尚未填完整,Disable submit Button to get prime");
        // }
        if (update.status.number === 2) {
            // console.log("number 欄位有錯誤，此時在 CardView 裡面會用顯示 errorColor");
            el_id("payment_1_status").textContent="✖";
            el_id("payment_1_status").style.color="#c55326e7";
        } else if (update.status.number === 0) {
            el_id("payment_1_status").textContent="✔";
            el_id("payment_1_status").style.color="#448899";
        } else {
            return;
        }
    
        if (update.status.expiry === 2) {
            el_id("payment_2_status").textContent="✖";
            el_id("payment_2_status").style.color="#c55326e7";
        } else if (update.status.expiry === 0) {
            el_id("payment_2_status").textContent="✔";
            el_id("payment_2_status").style.color="#448899";
        } else {
            return;
            // setNumberFormGroupToNormal()
        }
    
        if (update.status.ccv === 2) {
            el_id("payment_3_status").textContent="✖";
            el_id("payment_3_status").style.color="#c55326e7";
        } else if (update.status.ccv === 0) {
            el_id("payment_3_status").textContent="✔";
            el_id("payment_3_status").style.color="#448899";
        } else {
           return;
        }
    })
}

TPDirect_card_getPrime = (data) => {
    // =========================================================== 聯絡資訊不完整
    if(el("contact_input").value=="" | el("contact_input",1).value=="" | el("contact_input",2).value==""){
        error_box_show();
        // ======================
        el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
        el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
        el_id("close_error_box").setAttribute("src","/icon_close.png");
        el("error_box_inner_stitle").textContent="'您的聯絡資訊' 輸入不完整";
        el("error_box_inner_text").textContent="請確認 '您的聯絡資訊' 是否輸入完整";
        // ======================
        error_box_close(); 
        return;
    }
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();
    console.log(tappayStatus);
    if (tappayStatus.canGetPrime === false) {
        console.log(tappayStatus["status"]);
        error_box_show();
        // ======================
        el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
        el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
        el_id("close_error_box").setAttribute("src","/icon_close.png");
        el("error_box_inner_stitle").textContent="'信用卡付款資訊' 輸入不完整";
        el("error_box_inner_text").textContent="請確認 '信用卡付款資訊' 是否輸入完整";
        // ======================
        error_box_close(); 
        return "appayStatus error,資料不完整"
    }

    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            console.log(result.msg);
            // alert('get prime error ' + result.msg)
            return result.msg
        }
        let prime=result.card.prime;
        confirm_order(prime,data);
    })
}  

// ============================================================= confirm_order

confirm_order = (prime,data) =>{
    console.log(data);
    order={
        "prime": prime,
        "order": {
            "price": data["data"]["price"],
            "trip": {
                "attraction": {
                "id": data["data"]["attraction"]["id"],
                "name": data["data"]["attraction"]["name"],
                "address": data["data"]["attraction"]["address"],
                "image": data["data"]["attraction"]["image"]
                },
                "date": data["data"]["date"],
                "time": data["data"]["time"]
            },
            "contact": {
                "name": el("contact_input").value,
                "email": el("contact_input",1).value,
                "phone": el("contact_input",2).value
            }
        }
    }
    console.log(order);
    let url="api/orders";
    fetch(url,{                     // ========================================= fetch
        method: "POST",
        body: JSON.stringify(order),
        headers: new Headers({
            "content-type": "application/json"
          })
    })
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
        if (data["error"]==true){
            error_msg=data["message"];
            error_box_show();
            // ======================
            el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
            el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
            el_id("close_error_box").setAttribute("src","/icon_close.png");
            el("error_box_inner_stitle").textContent="'訂單建立失敗'";
            el("error_box_inner_text").textContent=error_msg;
            // ======================
            error_box_close(); 
            return;
        }else{
            order_number=data["data"]["number"];
            console.log(order_number);
            id=order["order"]["trip"]["attraction"]["id"];
            remove_booking(id);
            window.location.href="/thankyou"+"?number="+order_number;
        }
    })
}

// ============================================================= (還沒有帳戶？點此註冊) (已經有帳戶了？點此登入) 的 eventListener
var flag;
register_member = () => {
    let register_member=el_id("register_member");
    flag=true;
    register_member.addEventListener("click",create_new_member);
}

create_new_member = () => {
    let login_box=el("login_box");
    let login_0=el("login_box_inner_stitle",0);
    let login_1=el_id("login_1");
    let login_2=el_id("login_2");
    let login_botton=el_id("login_botton");
    let register_member=el_id("register_member");
    let message=el_id("message");
    message.textContent="";
    if (flag){
        login_box.style.height="350px";
        login_0.textContent="註冊會員帳號";
        login_1.style.display="block";
        login_2.setAttribute("placeholder","輸入電子郵件");
        login_botton.textContent="註冊新帳戶";
        register_member.textContent="已經有帳戶了？點此登入";
        flag=false;
    }else{
        login_box.style.height="290px";
        login_0.textContent="登入會員帳號";
        login_1.style.display="none";
        login_2.setAttribute("placeholder","輸入電子信箱");
        login_botton.textContent="登入帳戶";
        register_member.textContent="還沒有帳戶？點此註冊";
        flag=true;
    } 
}

// ============================================================= 註冊 和 登陸 按鈕
dircet_to_login_system = (click) => {
    let login_text=click.target.innerText;
    let login_box=el("login_box");
    let message=el_id("message");
    let login_1=el_id("login_1").value;
    let login_2=el_id("login_2").value;
    let login_3=el_id("login_3").value;
    if(login_text=="登入帳戶"){      // ========================================= 登入帳戶
        if(login_2==''||login_3==''){
            login_box.style.height="310px";
            message.textContent="信箱或密碼，不得為空";
        }else{
            login_system('',login_2,login_3,message);
        }    
    }else{                         // ========================================= 註冊新帳戶
        if(login_1==''||login_2==''||login_3==''){
            login_box.style.height="370px";
            message.textContent="信箱、帳號或密碼，不得為空";
        }else{
            login_system(login_1,login_2,login_3,message);
        }    
    }
}

login_system = (name,email,password,message) => {
    let current_page=location.href;
    let info={};
    let url="/api/user"
    let methods;
    if (name==''){                  // ========================================= for PATCH 
        el("login_box").style.height="310px";
        info["email"]=email;
        info["password"]=password;
        methods="PATCH";
    }else{                          // ========================================= for POST
        el("login_box").style.height="370px";
        info["name"]=name;
        info["email"]=email;
        info["password"]=password;
        methods="POST";
    }
    fetch(url,{                     // ========================================= fetch
        method: methods,
        body: JSON.stringify(info),
        headers: new Headers({
            "content-type": "application/json"
          })
    })
    .then(res=>res.json())
    .then((data)=>{
        if(methods=="PATCH"){   
            if(data["ok"]){                     // ============================== fetch PATCH
                // document.cookie='"user_token"='+data.user_token+';SameSite=Lax';
                el("nav_right_item",1).textContent="登出系統";
                el("login_box").style.display="none";
                el("body_cover").style.display="none";
                el("nav").style.filter="brightness(1.0)";
                location.href=current_page;
                // check_user_status();
            }else if(data["error"]){
                message.textContent=data.message;
            }else{
                message.textContent=data.message;
            }
        }else if(methods="POST"){               // ============================== fetch POST
            if(data["ok"]){
                message.textContent="註冊成功";
                el_id("login_1").value="";
                el_id("login_2").value="";
                el_id("login_3").value="";
                // check_user_status();
            }else if(data["error"]){
                message.textContent=data.message;
            }else{
                message.textContent=data.message;
            }
        }
    })
}

// ============================================================= 跳出會員提示框 (按下登出系統)、關閉會員提示框 和 點擊登出系統
login_show = () => {
    let current_page=location.href;
    let nav_login=el("nav_right_item",1);
    if (nav_login.innerText=="登陸/註冊"){
        el("body_cover").style.display="block";
        el("nav").style.filter="brightness(0.75)";
        el("login_box").style.display="block";
    }else{
        el("login_box").style.display="none";
        // let exp = new Date();
        // exp.setTime(exp.getTime() - 1);
        // document.cookie=document.cookie+';expires='+exp.toGMTString()+';SameSite=Lax ;path=/';
        // console.log(document.cookie);
        user_logout(current_page);
    } 
}

async function user_logout(current_page){
    let res = await fetch("/api/user",{method: "DELETE"});
    data = await res.json();
    console.log(data);
    el("nav_right_item",1).textContent="登陸/註冊";
    location.href=current_page;
    booking_data_remove();
}

async function  booking_data_remove(){
    let res = await fetch("/api/booking",{method: "GET"});
    data = await res.json();
}

close_login_box = () => {
    let close_login_box=el_id("close_login_box");
    close_login_box.addEventListener("click",back_to_og_page)
}

back_to_og_page = () => {
    let body_cover=el("body_cover");
    body_cover.style.display="none";
    let nav=el("nav");
    nav.style.filter="brightness(1.0)";
    let login_box=el("login_box");
    login_box.style.display="none";
    nav_eventListener();
}

// ============================================================= for blue circle 

price_click_eventListener = () => {
    let circle_first=el("blue_circle");
    let circle_second=el("blue_circle",1);
    circle_first.style.background="#448899";
    circle_first.addEventListener("click",circle_click,false);
    circle_second.addEventListener("click",circle_click,false); 
}

circle_click = (click) => {
    first=el("blue_circle");
    second=el("blue_circle",1);
    right_botton=el("right_bottom_span2");
    first.style.backgroundColor="#ffffff";
    second.style.backgroundColor="#ffffff";
    if(click.target==first){
        right_botton.textContent="新台幣 2000 元";
        first.style.backgroundColor="#448899";
    }else{
        right_botton.textContent="新台幣 2500 元";
        second.style.backgroundColor="#448899";
    }
}

slider = (pic) => {
    // =============================================================create img
    let slides=document.createElement("div");
    for (num=0;num<pic.length;num++) {
        let slides_img=document.createElement("img");
        slides.className="slides";
        slides_img.setAttribute("src",pic[num]);
        slides_img.className="slides_img";
        slides.appendChild(slides_img);
    }
    section_left.appendChild(slides);

    // =============================================================create manual radio
    let manual=document.createElement("div");
    manual.className="manual";
    for(num=0;num<pic.length;num++) {
        let manual_label=document.createElement("label");
        manual_label.htmlFor=`radio${num+1}`;
        manual_label.className="manual_label";
        manual.appendChild(manual_label);
        console.log(manual_label);
        console.log(manual);
        manual_label.addEventListener("click",slide_change_img)
    }
    section_left.appendChild(manual);
    old_botton=document.getElementsByClassName("manual_label")[0];
    old_botton.style.background="#ffffff";
    // =============================================================create change pic icon
    let change_icon=document.createElement("div");
    change_icon.className="change_icon";
    for(num=0;num<2;num++){
        let icon_cursor=document.createElement("div");
        icon_cursor.className="icon_cursor";
        let arrows=document.createElement("div");
        arrows.className="arrow_left";
        icon_cursor.appendChild(arrows);
        change_icon.appendChild(icon_cursor);
        icon_cursor.addEventListener("click",arrow_change_icon);
    }
    section_left.appendChild(change_icon);
    document.getElementsByClassName("arrow_left")[1].className="arrow_right";
}
// =============================================================silder effect

var pic_num=[];
slide_change_img = (click) => {
    let img_width=document.getElementById("section_left").offsetWidth;
    console.log("圖片這格大小現在",img_width);
    // =============================================================================img_width
    let botton=document.querySelectorAll(".manual_label");
    console.log(botton.length);
    botton.forEach((ele)=>ele.style.backgroundColor="transparent");
    // =============================================================================arrow botton effect
    if(click=="right"){
            // console.log('pic_num["num"]',pic_num["num"]);
            // console.log('manual_label',manual_label)
        if(pic_num["num"]===undefined){
            pic_num["num"]=1;
        }
        n_p=pic_num["num"];
        manual_label=document.getElementsByClassName("manual_label")[n_p];
        if(manual_label===undefined){
            n_p-=n_p;
            console.log(n_p);
            manual_label=document.getElementsByClassName("manual_label")[n_p];
        }
        manual_label.style.backgroundColor="#ffffff";
        newSlide=document.getElementsByClassName("slides_img")[0];
        newSlide.style.marginLeft=`-${n_p*img_width}px`;
        pic_num["num"]=n_p+1;
        return;
    }else if(click=="left"){
        console.log("left");
        if(pic_num["num"]===undefined){
            pic_num["num"]=(botton.length)+1;
        }
        n_p=pic_num["num"];
        console.log(n_p-2);
        manual_label=document.getElementsByClassName("manual_label")[n_p-2];
        if(manual_label===undefined){
            n_p=botton.length+1;
        }
        manual_label=document.getElementsByClassName("manual_label")[n_p-2];
        manual_label.style.backgroundColor="#ffffff";
        newSlide=document.getElementsByClassName("slides_img")[0];
        newSlide.style.marginLeft=`-${(n_p-2)*img_width}px`;
        pic_num["num"]=n_p-1;
        console.log(pic_num["num"]);
        return;
    }
    // ========================================================================end of arrow botton effect
    let start_Page=1;
    let num=click.target["attributes"][0]['nodeValue'];
    click.target.style.backgroundColor="#ffffff";
    num=Number(num.toString().replace("radio",""));
    pic_num["num"]=num;
    console.log(pic_num);
    // ==========================================
    if(num==1){
        newSlide=document.getElementsByClassName("slides_img")[0];
        newSlide.style.marginLeft="0px";
    }else if(start_Page<num){
        move_page=num-start_Page;
        newSlide=document.getElementsByClassName("slides_img")[0];
        newSlide.style.marginLeft=`-${move_page*img_width}px`;
    }else{
        return;
    }
}

// ============================================================= for slider's arrow botton

arrow_change_icon = (click) => {
    click=click.target["className"];
    if(click=="arrow_right"){
        right="right";
        slide_change_img(right);
    }else if(click=="arrow_left"){
        left="left";
        slide_change_img(left);
    }else{
        return;
    }
}

// -----------------------------------------------------------

fetchUrl = (url) => {
    fetch(url,{method: 'GET'})
    .then((res)=>{
        return res.json();
    })
    .then((data)=>{
        if(data["error"]){
            appendElements(data,url='');
            return data;          
        }else{
            nextPage=data.nextPage;
            dataLen=data.data.length; 
            if( 0 < dataLen && dataLen < 12 && data.nextPage=="null"){
                appendElements(data,url);
                return nextPage;
            }else{
                appendElements(data,url);
                return nextPage;
            }
        }
    })
    .then((nextPage)=>{
        if (nextPage['error']){
            // console.log("沒找到");
        }else{
            callback = (entry) => {               
                if(nextPage=="null"){
                    observer.unobserve(newTarget);
                }
                else if (entry[0].isIntersecting & url.includes("keyword")){
                    observer.unobserve(newTarget);
                    url=`${url}&page=${nextPage}`;
                    fetchUrl(url);
                }
                else if (entry[0].isIntersecting ) {
                    observer.unobserve(newTarget);
                    indexPage(nextPage); 
                }
            };
        let target = document.getElementsByClassName('attraction_box');
        let newTarget = target[target.length-1];
        let options = { 
            rootMargin: "155px 0px -155px",
            threshold: 1.0,
            };
        let observer = new IntersectionObserver(callback,options);
        observer.observe(newTarget);
        let botton = document.getElementById("search");
        botton.addEventListener("click",select);
        // -----------------------------------------------------------
        }
    })
}

// ------回應前端頁面------/attraction/${id}--------------------
mouseover = (click) => {
    let keyword = click.target.parentNode.childNodes[1].innerText;
    get_id_by_keyword(keyword);
}

async function get_id_by_keyword(keyword){
    let data = await fetch(`api/attractions?keyword=${keyword}`);
    data = await data.json();
    id=data.data[0]["id"];
    window.location.href = `/attraction/${id}`;
}

get_data_by_id = (data) =>{
    let id=data.data[0]["id"];
    let pic=data.data[0]["images"];
    let name=data.data[0]["name"];
    let mrt=data.data[0]["mrt"];
    let cat=data.data[0]["category"];
    let des=data.data[0]["description"]
    let address=data.data[0]["address"];
    let trans=data.data[0]["transport"];
    return (id,pic,name,mrt);
}   

// ============================================================= for index page append and create attraction's pic

appendElements = (data,url) => {
    let attraction=document.createElement("div");
    attraction.className="attraction";
    let footer=el("footer");
    // ---------------------------------
    if(url.includes("keyword")&url.includes("page")){
        if(0<el("attraction",["length"])){
            attraction.style.marginTop="-25px";
            // console.log("測試測試2");
            // console.log(el("attraction",["length"]));
        }
        append(data,attraction);
        document.body.insertBefore(attraction,footer);
    }else if(url.includes("keyword") | data["error"] ){
        elems = document.querySelectorAll('div.attraction');
        while (0<elems["length"]){
            document.body.removeChild(elems[0]);
            elems = document.querySelectorAll('div.attraction');
        }
            if(data["error"]){
                attraction.textContent="查無相關資料";
                document.body.insertBefore(attraction,footer);
            }else{
                append(data,attraction);
                document.body.insertBefore(attraction,footer);
            }
    }else{
        if(0<el("attraction",["length"])){
            attraction.style.marginTop="-25px";
        }
        append(data,attraction);
        document.body.insertBefore(attraction,footer);
    }
};

append = (data,attraction) => {
    console.log(data);
    num=0;
    for(num;num<data.data.length;num++){
        let attraction_box=document.createElement("div");
        let pic=document.createElement("img");
        let text=document.createElement("div");
        let cat=document.createElement("div");
        let catMrt=document.createElement("span");
        let catCat=document.createElement("span");
        // -------------------------------------------
        attraction_box.className="attraction_box";
        pic.className="pic";
        text.className="text";
        cat.className="cat";
        catMrt.className="catMrt";
        catCat.className="catCat";
         // -------------------------------------------
        info=data.data[num];
        pic.setAttribute("src",data.data[num]["images"][0]);
        text.textContent=info["name"];
        catMrt.textContent=info["mrt"];
        catCat.textContent=info["category"];
        // -------------------------------------------
        attraction_box.appendChild(pic);
        attraction_box.appendChild(text);
        attraction_box.appendChild(cat);
        cat.appendChild(catMrt);
        cat.appendChild(catCat);
        attraction.appendChild(attraction_box);
        // -------------------------------------------
        attraction_box.addEventListener("click",mouseover,false);
    }
    return attraction;
};