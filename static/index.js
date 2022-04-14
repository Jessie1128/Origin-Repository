// ============================================   model   ==========================================

fetch_url = (url, method, options) => {
    return fetch( url,{                     
        method: method,
        options
    })
    .then(res=>res.json())
    .then((info)=>{
        data=info;
        console.log(data);
        return data;
    })
}

async function fetch_attraction (url,method) {
    let data = await fetch_url(url,method);
    console.log(data);
    if(data["error"]){
        create_home_page_elements(data,url);     
    }else{
        create_home_page_elements(data,url);
        show_next_page_info(data["nextPage"],url);
    }
}

async function check_user_status () {
    let data = await fetch_url("/api/user","GET","");
    user_status_response_nav(data);
}

fetch_info_by_login_box = (info,method) => {
    return fetch("/api/user",{                    
        method: method,
        body: JSON.stringify(info),
        headers: new Headers({
            "content-type": "application/json"
          })
    })
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
        return data;
    })
}

async function every_attraction_click (click) {  
    let keyword = click.target.parentNode.childNodes[1].innerText;
    let data= await fetch_url(`api/attractions?keyword=${keyword}`,"GET")
    id=data.data[0]["id"];
    window.location.href = `/attraction/${id}`;
}

async function user_logout(current_page){
    let data = await fetch_url("/api/user","DELETE");
    if (data){
        el("nav_right_item",1).textContent="登陸/註冊";
        location.href=current_page;
    }
}

fetch_reserved_trip_info = (info) => {    
    return fetch("/api/booking",{                   
        method: "POST",
        body: JSON.stringify(info),
        headers: new Headers({
            "content-type": "application/json"
        })
    })
    .then(res=>res.json())
    .then((data)=>{
        return data;
    })  
}

async function check_order_info () {
    let order_num=location.href;
    order_num=order_num.substring(order_num.lastIndexOf("=")+1);
    let data = await fetch_url(`/api/orders?number=${order_num}`,"GET");
    if(data["error"]==true){
        go_to_homePage();
    }else if(data["data"]==null){
        go_to_homePage();
    }else{  
        thankyou_page_inner(data);
    }   
}

check_booking_info = () => {
    fetch("/api/booking",{method:"GET"})
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
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

fetch_confirm_order = (order) => {
    url="api/orders";
    return fetch(url,{                     // ========================================= fetch
        method: "POST",
        body: JSON.stringify(order),
        headers: new Headers({
            "content-type": "application/json"
          })
    })
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
        render_confirm_order(data,order);
    })
}

remove_booking = (id,click) => {
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
        if(data["ok"]==true & click===undefined){   //======================= for 付款完成刪掉購物車
            window.location.href="/thankyou"+"?number="+order_number;
        }else{                                      //======================= for 刪除預定行程按鈕
            go_to_bookingPage();
        }
    })
}





// ============================================   view   ===========================================

el = (className,num=0) => { 
    return document.getElementsByClassName(className)[num];
}

el_id = (idName) => {
    return document.getElementById(idName);
}

el_tag = (tagName, num=0) =>{
    return document.getElementsByTagName(tagName)[num];
}

// ============================

go_to_homePage = () => {
    window.location.href="/";
}

go_to_bookingPage = () => {
    window.location.href="/booking";
}

// ============================

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

// ============================

var flag;
login_and_register = () => {
    el_id("message").textContent="";
    if (flag){
        el("login_box").style.height="350px";
        el("login_box_inner_stitle").textContent="註冊會員帳號";
        el_id("login_1").style.display="block";
        el_id("login_2").setAttribute("placeholder","輸入電子郵件");
        el_id("login_botton").textContent="註冊新帳戶";
        el_id("register_member").textContent="已經有帳戶了？點此登入";
        flag=false;
    }else{
        el("login_box").style.height="290px";
        el("login_box_inner_stitle").textContent="登入會員帳號";
        el_id("login_1").style.display="none";
        el_id("login_2").setAttribute("placeholder","輸入電子信箱");
        el_id("login_botton").textContent="登入帳戶";
        el_id("register_member").textContent="還沒有帳戶？點此註冊";
        flag=true;
    } 
}

close_member_login_box = () => {
    el("body_cover").style.display="none";
    el("nav").style.filter="brightness(1.0)";
    el("login_box").style.display="none";
    // nav_eventListener();
}

login_show = () => {
    let current_page=location.href;
    if (el("nav_right_item",1).innerText=="登陸/註冊"){
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

async function login_or_register_box (click) {
    let login_text=click.target.innerText;
    let name=el_id("login_1").value;
    let email=el_id("login_2").value;
    let password=el_id("login_3").value;
    let info={
        "name":name,
        "email":email,
        "password":password
    }
    if(login_text=="登入帳戶"){      // ========================================= 登入帳戶
        if( email =='' || password =='' ){
            el("login_box").style.height="310px";
            el_id("message").textContent="信箱或密碼，不得為空";
        }else{
            let data= await fetch_info_by_login_box(info,"PATCH");
            render_login_or_register_box(info,data);
        }    
    }else{                         // ========================================= 註冊新帳戶
        if( name=='' | email=='' | password=='' ){
            el("login_box").style.height="370px";
            el_id("message").textContent="信箱、帳號或密碼，不得為空";
        }else{
            let data= await fetch_info_by_login_box(info,"POST");
            render_login_or_register_box(info,data);
        }    
    }
}

render_login_or_register_box = (info,data) => {
    let current_page=location.href;
    // ============================== 登入的畫面處理
    if(info["name"]==''){
        if(data["ok"]){                     
            el("nav_right_item",1).textContent="登出系統";
            el("login_box").style.display="none";
            el("body_cover").style.display="none";
            window.location.href=current_page;
        }else if(data["error"]){
            el_id("message").textContent=data.message;
            el("login_box").style.height="310px";
        }else{
            el_id("message").textContent=data.message;
            el("login_box").style.height="310px";
        }
    }else{
    // ============================== 註冊的畫面處理
        el("login_box").style.height="370px";
        if(data["ok"]){
            el_id("message").textContent="註冊成功，請重新登入會員";
            el_id("login_1").value="";
            el_id("login_2").value="";
            el_id("login_3").value="";
            fetch_url("/api/user","DELETE");
        }else if(data["error"]){
            el_id("message").textContent=data.message;
        }else{
            el_id("message").textContent=data.message;
        }
    }
}

user_status_response_nav = (info) =>{
    console.log(info);
    if (info["data"]==null){       
        el("nav_right_item").addEventListener("click",login_show);   
    }else{
        el("nav_login_logo").style.padding="10px";
        el("nav_login_logo").style.height="18px";
        el("nav_login_logo").style.width="18px";
        el("nav_login_logo").textContent=info["data"]["name"].substr(0, 1);
        el("nav_right_item",1).textContent="登出系統";        
        el("login_box").style.display="none";
        el("nav_right_item").addEventListener("click",go_to_bookingPage);    
    }
}

show_next_page_info = (nextPage,url) => {
    console.log(nextPage);
    callback = (entry) => { 
        if(nextPage=="null"){
            observer.unobserve(newTarget);
        }
        else if (entry[0].isIntersecting & url.includes("keyword")){
            observer.unobserve(newTarget);
            url=`${url}&page=${nextPage}`;
            fetch_attraction(url,"GET");
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
}

search_attraction_by_keyword = () => {
    textInput = el_id("header_input").value;
    if (textInput==''){
        error_box_show();
        el("error_box_inner_stitle").textContent="欄位輸入不正確";
        el("error_box_inner_text").textContent="'輸入景點名稱查詢' 欄位不得為空";
        error_box_close(); 
    }else{
        fetch_attraction(`/api/attractions?keyword=${textInput}`,"GET");
    }
};

async function get_attraction_info_by_id () {
    let path=location.pathname;
    let id=path.substring(path.lastIndexOf("/")+1);
    let data = await fetch_url(`/api/attraction/${id}`,"GET","");
    let mrt;
    if(data.data["mrt"]==null){
        mrt="劍潭";
    }else{
        mrt=data.data["mrt"];
    }
    el("attraction_name").textContent=data.data["name"];
    el("attraction_loca").textContent=`${data.data["category"]} at ${mrt}`;
    el_tag("p",5).textContent=data.data["description"];
    el_tag("p",7).textContent=data.data["address"];
    el_tag("p",9).textContent=data.data["transport"];
    create_slider_box(data.data["images"]);
}

create_home_page_elements = (data,url) => {
    let attraction=document.createElement("div");
    attraction.className="attraction";
    // ---------------------------------
    if(url.includes("keyword") & url.includes("page")){
        if(0<el("attraction",["length"])){
            attraction.style.marginTop="-25px";
        }
        create_home_page_elements_inner(data,attraction);   
    }else if(url.includes("keyword") | data["error"] ){
        elems = document.querySelectorAll('div.attraction');
        while (0<elems["length"]){
            document.body.removeChild(elems[0]);
            elems = document.querySelectorAll('div.attraction');
        }
        if(data["error"]){
            keyword=url.substring(url.lastIndexOf("=")+1);
            attraction.style.gridTemplateColumns="auto";
            attraction.textContent="搜尋結果：查無與 ' "+keyword+" ' 有關的景點資訊";
            document.body.insertBefore(attraction,el("footer"));
        }else{
            create_home_page_elements_inner(data,attraction);
        }
    }else{
        if(0<el("attraction",["length"])){
            attraction.style.marginTop="-25px";
        }
        create_home_page_elements_inner(data,attraction);       
    }
};

create_home_page_elements_inner = (data,attraction) => {
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
        if(info["mrt"]==null){
            catMrt.textContent="劍潭";
        }else{
            catMrt.textContent=info["mrt"];
        }
        catCat.textContent=info["category"];
        // -------------------------------------------
        attraction_box.appendChild(pic);
        attraction_box.appendChild(text);
        attraction_box.appendChild(cat);
        cat.appendChild(catMrt);
        cat.appendChild(catCat);
        attraction.appendChild(attraction_box);
        // -------------------------------------------
        attraction_box.addEventListener("click",every_attraction_click,false);
    }
    document.body.insertBefore(attraction,el("footer"));
};

click_AM_PM = (click) => {
    right_botton=el("right_bottom_span2");
    el("blue_circle").style.backgroundColor="#ffffff";
    el("blue_circle",1).style.backgroundColor="#ffffff";
    if(click.target==el("blue_circle")){
        right_botton.textContent="新台幣 2000 元";
        el("blue_circle").style.backgroundColor="#448899";
    }else{
        right_botton.textContent="新台幣 2500 元";
        el("blue_circle",1).style.backgroundColor="#448899";
    }
}

create_slider_box = (pic) => {
    console.log(pic);
    console.log(pic.length);
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
        manual_label.addEventListener("click",slider_change_img_by_arrow);
    }
    section_left.appendChild(manual);
    el("manual_label").style.background="#ffffff";
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
        icon_cursor.addEventListener("click",slider_arrow_click_eventListener);
    }
    section_left.appendChild(change_icon);
    el("arrow_left",1).className="arrow_right";
}

slider_arrow_click_eventListener = (click) => {
    click=click.target["className"];
    if(click=="arrow_right"){
        console.log("右邊的鍵");
        slider_change_img_by_arrow("right");
    }else if(click=="arrow_left"){
        console.log("左邊的鍵");
        slider_change_img_by_arrow("left");
    }
}

var pic_num=[];
slider_change_img_by_arrow = (click) => {
    let img_width=el_id("section_left").offsetWidth;
    let botton=document.querySelectorAll(".manual_label");
    botton.forEach((ele)=>ele.style.backgroundColor="transparent");
    console.log("圖片這格大小現在",img_width);
    // =============================================================================arrow botton effect
    if(click=="right"){

        let pic=pic_num["num"];
        if(pic===undefined){
            pic=1;
        }
        let manual_label=el("manual_label",[pic]);
        if(manual_label===undefined){
            pic-=pic;
            manual_label=el("manual_label",[pic]);
        }
        manual_label.style.backgroundColor="#ffffff";
        el("slides_img").style.marginLeft=`-${pic*img_width}px`;
        pic_num["num"]=pic+1;
        return;

    }else if(click=="left"){
        
        let pic=pic_num["num"];
        if(pic===undefined){
            pic=(botton.length)+1;
        }
        manual_label=el("manual_label",[pic-2]);
        if(manual_label===undefined){
            pic=botton.length+1;
            manual_label=el("manual_label",[pic-2]);
        }
        manual_label.style.backgroundColor="#ffffff";
        el("slides_img").style.marginLeft=`-${(pic-2)*img_width}px`;
        pic_num["num"]=pic-1;
        return;

    }else if ( click!="left" && click!="right" ) {
        let num=click.target["attributes"][0]['nodeValue'];
        click.target.style.backgroundColor="#ffffff";
        num=Number(num.toString().replace("radio",""));
        pic_num["num"]=num;
        // ==========================================
        if(num==1){
            el("slides_img").style.marginLeft="0px";
        }else if(1<num){
            num=num-1;
            el("slides_img").style.marginLeft=`-${num*img_width}px`;
        }
    }
}

async function reserve_a_trip ()  {
    if(el("nav_right_item",1).innerText=="登陸/註冊"){     
        el("body_cover").style.display="block";
        el("nav").style.filter="brightness(0.75)";
        el("login_box").style.display="block";      
    }else{
        let info={};
        let id=location.pathname;
        info["attractionId"]=id.substring(id.lastIndexOf("/")+1);
        info["date"]=el_id("date").value;
        if(el("right_bottom_span2").innerText=="新台幣 2000 元"){
            info["price"]="2000";
            info["time"]="morning";
        }else{
            info["price"]="2500";
            info["time"]="afternoon";
        }
        let data= await fetch_reserved_trip_info(info);
        console.log(data);
        successfully_reserve_a_trip(data,info);
    }
}

successfully_reserve_a_trip = (data,info) =>{
    if (data["error"]==true & data["message"]=="建立失敗，輸入不正確或其他原因"){
        let today=new Date().toLocaleString('zh', { hour12: false });
        today=today.replace(/\//g, '-');
        error_box_show();
        el("error_box_inner_stitle").textContent="欄位輸入不正確"; 
        if (info["date"] == ''){
            el("error_box_inner_text").textContent="'選擇日期' 欄位不得為空";
            el("error_box").style.height="100px";
        }else if( info["date"]<today | info["date"]==today){
            el("error_box_inner_text").textContent="'選擇日期' 欄位，\n請選擇今天以後的日期";
            el("error_box").style.height="116px";
        }else{
            el("error_box_inner_text").textContent="啥";
        }
        error_box_close();           
    }else{
        go_to_bookingPage();
    }
}

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

render_confirm_order = (data,order) => {
    console.log(data);
    if (data["error"]==true){
        error_msg=data["message"];
        error_box_show();
        el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
        el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
        el_id("close_error_box").setAttribute("src","/icon_close.png");
        el("error_box_inner_stitle").textContent="訂單建立失敗";
        el("error_box_inner_text").textContent=error_msg;
        error_box_close(); 
    }else{
        order_number=data["data"]["number"];
        location.href="/thankyou"+"?number="+order_number;
        id=order["order"]["trip"]["attraction"]["id"];
        remove_booking(id);
    }
}

thankyou_page_inner = (data) => {
    el("main_inner_text_head").textContent="行程預定成功";
    el("main_inner_text_head",1).textContent="您的訂單您的訂單編號如下：";
    el("booking_order_num").innerHTML="訂單編號：<div class='booking_order_num_div'>"+data["data"]["number"]+"</div>";
    el("main_inner_text_ps").textContent="請記住此編號，或到會員中心查詢歷史訂單";
    total_height=el("nav").offsetHeight+el("main_inner").offsetHeight;
    el("footer").style.height="calc(100vh - "+total_height+"px)";
}






// ==========================================   controller   =======================================

// ======================== init
indexPage = (page) => {
    nav_eventListener();
    member_eventListener();
    close_login_box_eventListener();
    check_user_status();
    fetch_attraction(`/api/attractions?page=${page}`,"GET");
    search_bar_eventListener();
}

attractionPage = () =>{                         
    nav_eventListener();
    member_eventListener();
    close_login_box_eventListener();
    check_user_status();     
    get_attraction_info_by_id();                  
    choose_AM_PM_eventListener(); 
    reserve_attraction();
}

bookingPage = () => {
    nav_eventListener();
    member_eventListener();
    close_login_box_eventListener();
    check_user_status();  
    check_booking_info();
}

thank_you_page = () => {
    nav_eventListener();
    member_eventListener();
    close_login_box_eventListener();
    check_user_status();   
    check_order_info();
}
// ======================== init end

nav_eventListener = () =>{
    el("nav_left").addEventListener("click",go_to_homePage);
    el("nav_right_item",1).addEventListener("click",login_show);
    el_id("login_botton").addEventListener("click",login_or_register_box);
} 

member_eventListener = () => {
    flag=true;
    el_id("register_member").addEventListener("click",login_and_register);
}

close_login_box_eventListener = () => {
    el_id("close_login_box").addEventListener("click",close_member_login_box)
}

search_bar_eventListener = () => {
    el_id("search").addEventListener("click",search_attraction_by_keyword);
}

choose_AM_PM_eventListener = () => {
    el("blue_circle").style.background="#448899";
    el("blue_circle").addEventListener("click",click_AM_PM,false);
    el("blue_circle",1).addEventListener("click",click_AM_PM,false); 
}

reserve_attraction = () => {
    el("right_bottom_botton").addEventListener("click",reserve_a_trip); 
}






// =========================================================== for TapPay 


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
        if (update.status.number === 2) {
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
    let tappayStatus = TPDirect.card.getTappayFieldsStatus();
    console.log(tappayStatus);
    // =========================================================== 聯絡資訊不完整
    if(el("contact_input").value=="" | el("contact_input",1).value=="" | el("contact_input",2).value==""){
        error_box_show();
        el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
        el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
        el_id("close_error_box").setAttribute("src","/icon_close.png");
        el("error_box_inner_stitle").textContent="欄位輸入不正確";
        el("error_box_inner_text").textContent="請確認 '您的聯絡資訊' 是否輸入完整";
        error_box_close(); 
        return;
    }
    if (tappayStatus.canGetPrime === false) {
        console.log(tappayStatus["status"]);
        error_box_show();
        el("error_box").style.boxShadow="0px 4px 60px #aaaaaa";
        el("error_box_border").style.background="linear-gradient(270deg, #337788 0%, #66aabb 100%)";
        el_id("close_error_box").setAttribute("src","/icon_close.png");
        el("error_box_inner_stitle").textContent="欄位輸入不正確";
        el("error_box_inner_text").textContent="請確認 '信用卡付款資訊' 是否輸入完整";
        error_box_close(); 
        return "appayStatus error,資料不完整"
    }
     // =========================================================== 
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            console.log(result.msg);
            return result.msg
        }
        let prime=result.card.prime;
        let order={
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
        fetch_confirm_order(order);
    })
}  





