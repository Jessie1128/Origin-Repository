// =========================================================== getElementsBy ClassName & Id function
el = (className,num=0) => { 
    return document.getElementsByClassName(className)[num];
}

el_id = (idName) => {
    return document.getElementById(idName);
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
            el("body_cover").style.display="flex";
            el("error_box").style.display="flex";
            el("nav").style.filter="brightness(0.75)";
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
            el_id("close_error_box").addEventListener("click",()=>{
                el("body_cover").style.display="none";
                el("error_box").style.display="none";
                el("nav").style.filter="brightness(1.0)";
            })
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
        console.log(data);
        // console.log(data["data"]["attraction"]["id"]);
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
            
            // el("headline_1").style.display="none";
            // el("headline_2_left").setAttribute("src",data.data["attraction"]["image"]);
            // el_id("headline_2_name").textContent=data.data["attraction"]["name"];
            // el_id("headline_2_date").textContent=data.data["date"];
            // el_id("headline_2_time").textContent=time;
            // el_id("headline_2_price").textContent="新台幣 "+data.data["price"]+" 元";
            // el_id("headline_2_address").textContent=data.data["attraction"]["address"];
            // el("confirm_price_inner").textContent="新台幣 "+data.data["price"]+" 元";
            // el("remove_booking").addEventListener("click",remove_booking.bind(null,data["data"]["attraction"]["id"]));
        }
    })
}


// =========================================================== 處理 booking頁面 畫面
booking_page_no_info = () => {
    // console.log("沒東西");
    if (el("headline_1") != undefined){
        el("headline_1").remove();
    }
    if(el("headline_2") != undefined){
        el("headline_2").remove();
        el("contact").remove();
        el("payment").remove();
        el("confirm").remove();
        hr=document.querySelectorAll(".hr");
        hr.forEach(elem=>elem.remove());
    }
    headline_1=document.createElement("div");
    headline_1.className="headline_1";
    headline_1_inner=document.createElement("div");
    headline_1_inner.className="headline_1_inner";
    headline_1_inner.textContent="目前沒有任何待預訂的行程";
    headline_1.appendChild(headline_1_inner);
    document.body.insertBefore(headline_1,el("footer"));
    total_height=el("nav").offsetHeight+el("headline_main").offsetHeight+el("headline_1").offsetHeight;
    el("footer").style.height="calc(100vh - "+total_height+"px)";
}

booking_page_create_info = (data,time) => {
    // console.log(data,time)
    if (el("headline_1") != undefined){
        el("headline_1").remove();
    }
    if (el("headline_2_left")!= undefined){
        el("headline_2_left").remove();
        console.log("刪掉img");
    }
    // if(el("headline_2") != undefined){
    //     el("headline_2").remove();
    //     el("contact").remove();
    //     el("payment").remove();
    //     el("confirm").remove();
    //     hr=document.querySelectorAll(".hr");
    //     hr.forEach(elem=>elem.remove());
    // }
    console.log(data["data"]["date"]);
    // =========================================================== create headline_2
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
}
// =========================================================== 檢查使用者是否登陸 和 登出系統標示 和 nav的預定行程的 eventlistener
// var user;
check_user_status = () => {
    let current_page=location.href;
    let url="/api/user";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
        if (data["data"]==null){
            console.log("還沒登陸或是token錯誤")
            el("nav_right_item").addEventListener("click",login_show);    // ================ for 預定行程
        }else if(data.data["id"]!=null & data.data["name"]!=null & data.data["email"]!=null){
            el("nav_right_item",1).textContent="登出系統";        // ================ for 登入登出
            el("login_box").style.display="none";
            el("nav_right_item").addEventListener("click",go_to_bookingPage);     // ================ for 預定行程
            if (current_page.endsWith("/booking")){
                update_username_to_page(data);
            }
        }
    })
}


// =========================================================== booking頁面 '自動填入使用者資料' 和 '垃圾桶的 eventlistener'

update_username_to_page = (data) => {
    el("headline_main_name").textContent=data.data["name"];
    el("contact_input").value=data.data["name"];
    el("contact_input",1).value=data.data["email"];
}

remove_booking = (id) => {
    console.log("我要刪掉",id);
    let url="/api/booking";
    fetch(url,{                     // ========================================= fetch
        method: "DELETE",
        body: JSON.stringify({"id":id}),
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then(res=>res.json())
    .then((data)=>{
        if(data["ok"]==true){
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

// =========================================================== 重新導向到首頁

go_to_homePage = () => {
    window.location.href="/";
}

go_to_bookingPage = () => {
    window.location.href="/booking";
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
