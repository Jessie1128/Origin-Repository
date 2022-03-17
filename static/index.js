// var idList={};
// let home_page=document.getElementsByClassName("nav_left")[0];
// home_page.addEventListener("click",homePage);

indexPage = (page) => {
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
    let id=location.pathname;
    id=id.substring(id.lastIndexOf("/")+1);
    fetch(`/api/attraction/${id}`)
    .then(res=>res.json())
    .then((data)=>{
        let pic=data.data["images"][0];
        let name=data.data["name"];
        let mrt=data.data["mrt"];
        let cat=data.data["category"];
        let des=data.data["description"]
        let address=data.data["address"];
        let trans=data.data["transport"];
        console.log(name);
        document.getElementsByClassName("section_left")[0].setAttribute("src",pic);
        document.getElementsByClassName("attraction_name")[0].textContent=name;
        document.getElementsByClassName("attraction_loca")[0].textContent=`${cat} at ${mrt}`;
        document.getElementsByTagName('p')[5].textContent=des;
        document.getElementsByTagName('p')[7].textContent=address;
        document.getElementsByTagName('p')[9].textContent=trans;
    }) 
    eventListener();
}

homePage = () => {
    console.log("goooood");
    window.location.href="/";
}

eventListener = () =>{
    let home_page=document.getElementsByClassName("nav_left")[0];
    home_page.addEventListener("click",homePage);
    // ===========================================================
    let circle_first=document.getElementsByClassName("blue_circle")[0];
    let circle_second=document.getElementsByClassName("blue_circle")[1];
    console.log(circle_first,circle_second);
    circle_first.addEventListener("click",circle_click,false);
    circle_second.addEventListener("click",circle_click,false); 
} 

circle_click = (click) => {
    let right_bottom_sapn2=document.getElementsByClassName("right_bottom_sapn2")[0];
    if(click.target==document.getElementsByClassName("blue_circle")[0]){
        right_bottom_sapn2.textContent="新台幣 2000 元";
    }else{
        right_bottom_sapn2.textContent="新台幣 2500 元";
    }
}

// -----------------------------------------------------------


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
};
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

append_item = () => {

}





// -----------------------------------------------------------




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
        // idList[text.textContent]=data.data[num]["id"];
        attraction_box.addEventListener("click",mouseover,false);
        // console.log("現在在這邊",attraction_box);
    }
    return attraction;
};


// -----------------------------------------------------------
