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
    mouse_over_out();
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

attractionPage = () =>{                          //==============init attractionPage & right_bottom_botton 的註冊事件
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();                    
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
    price_click_eventListener(); 
    el("right_bottom_botton").addEventListener("click",attraction_reserve);
}

bookingPage = () => {
    nav_eventListener();
    register_member();
    close_login_box();
    check_user_status();
}

// =========================================================== nav 的 eventlistener 

nav_eventListener = () =>{
    let home_page=el("nav_left");
    // let nav_booking=el("nav_right_item");
    let nav_login=el("nav_right_item",1);
    let login_botton=el_id("login_botton");
    home_page.addEventListener("click",homePage);
    // nav_booking.addEventListener("click",booking);
    nav_login.addEventListener("click",login_show);
    login_botton.addEventListener("click",dircet_to_login_system);
} 

// ===========================================================  mouseover & mouseout 的 eventlistener 
mouse_over_out = () => {

}

// =========================================================== 景點的預定行程的 eventlistener & 跳轉到booking頁面

attraction_reserve = (click) => {
    console.log(click.target);
    console.log(click);
    console.log(user)
    if(user == null){     
        console.log("目前還沒登陸")
    }else{
        let book_date=el_id('date').value;
        let price=el('right_bottom_sapn2').innerText;
        let book_id=location.pathname;
        book_id=book_id.substring(book_id.lastIndexOf("/")+1);
        location.href = "/booking";
        redirect_to_booking(book_date,price,book_id);
    }
    // el("right_bottom_botton")
}

redirect_to_booking = (book_date,price,book_id) => {
    // if(click.target.className=="right_bottom_botton"){
    //     console.log("是按鈕");
    // }
}

// =========================================================== 檢查使用者是否登陸 和 登出系統標示 和n av的預定行程的 eventlistener
var user;
check_user_status = () => {
    let current_page=location.href;
    console.log(current_page);
    let url="/api/user";
    fetch(url,{method: "GET"})
    .then(res=>res.json())
    .then((data)=>{
        console.log(data);
        if (data["data"]==null){
            console.log("還沒登陸或是token錯誤")
            console.log("user_info",user);
            return;
        }else if(data.data["id"]!=null & data.data["name"]!=null & data.data["email"]!=null){
            el("nav_right_item",1).textContent="登出系統";
            el("login_box").style.display="none";
            let nav_booking=el("nav_right_item");
            console.log(nav_booking);
            nav_booking.addEventListener("click", attraction_reserve); 
            nav_booking.className="nav_right_item booking";
            user=data;
            console.log("user_info",user);
        }
    })
}

// =========================================================== 重新導向

homePage = () => {
    window.location.href="/";
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
    console.log("我現在在這邊");
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
    console.log("nav_login.innerText",nav_login.innerText);
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
        let url="/api/user";
        fetch(url,{method: "DELETE"})
        .then(res=>res.json())
        .then((data)=>{
            user='';
            el("nav_right_item",1).textContent="登陸/註冊";
            location.href=current_page;
        })
    } 
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
    right_botton=el("right_bottom_sapn2");
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
    let footer=document.getElementsByClassName("footer")[0];
    // ---------------------------------
    if(url.includes("keyword")&url.includes("page")){
        if(0<document.getElementsByClassName("attraction")["length"]){
            attraction.style.marginTop="-25px";
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
        if(0<document.getElementsByClassName("attraction")["length"]){
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

// ============================================================= for booking
