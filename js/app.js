// Supabase connection

const SUPABASE_URL = window.env.SUPABASE_URL
const SUPABASE_KEY = window.env.SUPABASE_ANON_KEY


const supabaseClient = window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
)


// =========================
// REGISTER
// =========================

async function registerStudent(){

const name = document.getElementById("name").value
const roll = document.getElementById("roll").value
const email = document.getElementById("email").value
const password = document.getElementById("password").value

if(!email.endsWith("@gprec.ac.in")){
showToast("Only GPREC email allowed","error")
return
}

const {data,error} = await supabaseClient.auth.signUp({
email,
password
})

if(error){
showToast(error.message,"error")
return
}

showToast("Registration successful")

// redirect to login
window.location = "index.html"

}


// =========================
// LOGIN
// =========================

async function login(){

const email = document.getElementById("email").value
const password = document.getElementById("password").value

const {data,error} = await supabaseClient.auth.signInWithPassword({
email,
password
})

if(error){
showToast("Login failed","error")
return
}

const user = data.user

// check if profile exists
const {data:profile} = await supabaseClient
.from("profiles")
.select("*")
.eq("id",user.id)
.maybeSingle()

// if profile missing create it
if(!profile){

await supabaseClient.from("profiles").insert({
id:user.id,
email:user.email,
role:"student"
})

}

// fetch again
const {data:newProfile} = await supabaseClient
.from("profiles")
.select("role")
.eq("id",user.id)
.single()

if(newProfile.role==="admin"){
window.location="admin.html"
}else{
window.location="dashboard.html"
}

}


// =========================



// LOGOUT
// =========================

async function logout(){

await supabaseClient.auth.signOut()

window.location="index.html"

}


// =========================
// ADD FOUND ITEM
// =========================

async function addFoundItem(){

const title=document.getElementById("title").value
const description=document.getElementById("description").value
const location=document.getElementById("location").value
const file=document.getElementById("photo").files[0]

const {data:{user}}=await supabaseClient.auth.getUser()

if(!user){
showToast("Login first","error")
return
}

let imageUrl=null

if(file){

const fileName=Date.now()+"_"+file.name

const {error}=await supabaseClient
.storage
.from("item-images")
.upload(fileName,file)

if(error){
showToast("Image upload failed")
return
}

const {data:urlData}=supabaseClient
.storage
.from("item-images")
.getPublicUrl(fileName)

imageUrl=urlData.publicUrl

}

await supabaseClient.from("items").insert({

title:title,
description:description,
location:location,
type:"found",
reported_by:user.email,
reporter_role:"student",
status:"available",
image_url:imageUrl

})

showToast("Found item reported")

}


// =========================
// REPORT LOST ITEM
// =========================

async function reportLost(){

const title=document.getElementById("item").value
const description=document.getElementById("description").value
const location=document.getElementById("location").value
const file=document.getElementById("lostPhoto").files[0]

const {data:{user}}=await supabaseClient.auth.getUser()

if(!user){
showToast("Login first")
return
}

let imageUrl=null

if(file){

const fileName=Date.now()+"_"+file.name

const {error}=await supabaseClient
.storage
.from("item-images")
.upload(fileName,file)

if(error){
showToast("Image upload failed")
return
}

const {data:urlData}=supabaseClient
.storage
.from("item-images")
.getPublicUrl(fileName)

imageUrl=urlData.publicUrl

}

await supabaseClient.from("items").insert({

title:title,
description:description,
location:location,
type:"lost",
reported_by:user.email,
reporter_role:"student",
status:"available",
image_url:imageUrl

})

showToast("Lost item reported")

}


// =========================
// LOAD FOUND + LOST ITEMS
// =========================

async function loadItems(){

const search=document.getElementById("search")?.value.toLowerCase() || ""

const foundContainer=document.getElementById("foundItems")
const lostContainer=document.getElementById("lostItems")

if(!foundContainer && !lostContainer) return

const {data}=await supabaseClient
.from("items")
.select("*")
.eq("status","available")
.order("created_at",{ascending:false})

if(foundContainer) foundContainer.innerHTML=""
if(lostContainer) lostContainer.innerHTML=""

data.forEach(item=>{

if(search && !item.title.toLowerCase().includes(search)){
return
}

if(item.type==="found" && foundContainer){

foundContainer.innerHTML+=`

<div class="border p-3 rounded flex justify-between items-center">

<div>

${item.image_url ? `<img src="${item.image_url}" class="w-20 h-20 object-cover mb-2 rounded">` : ""}

<h3 class="font-semibold">${item.title}</h3>

<p class="text-sm text-gray-600">${item.description}</p>

</div>

<button onclick="claimItem('${item.id}')"
class="bg-blue-500 text-white px-3 py-1 rounded">
Claim
</button>

</div>

`

}

if(item.type==="lost" && lostContainer){

lostContainer.innerHTML+=`

<div class="border p-3 rounded">

${item.image_url ? `<img src="${item.image_url}" class="w-20 h-20 object-cover mb-2 rounded">` : ""}

<h3 class="font-semibold">${item.title}</h3>

<p class="text-sm text-gray-600">${item.description}</p>

</div>

`

}

})

}


// =========================
// CLAIM ITEM
// =========================

async function claimItem(itemId){

const {data:{user}}=await supabaseClient.auth.getUser()

if(!user){

showToast("Please login first")

window.location="index.html"

return

}

const {data:existingClaim}=await supabaseClient
.from("claims")
.select("*")
.eq("item_id",itemId)
.eq("claimer_email",user.email)
.maybeSingle()

if(existingClaim){

showToast("You already claimed this item")

return

}

await supabaseClient.from("claims").insert({

item_id:itemId,
claimer_email:user.email,
status:"pending"

})

showToast("Claim request sent")

}


// =========================
// ADMIN INIT
// =========================

async function initAdmin(){

await checkAdmin()

await loadClaims()

await loadLostItemsAdmin()

}


// =========================
// LOAD CLAIMS
// =========================

async function loadClaims(){

const container=document.getElementById("claims")

if(!container) return

const search=document.getElementById("adminSearch")?.value.toLowerCase() || ""

const {data}=await supabaseClient
.from("claims")
.select("*,items(title,image_url)")
.order("created_at",{ascending:false})

container.innerHTML=""

data.forEach(claim=>{

const title=claim.items?.title || ""
const email=claim.claimer_email || ""

if(
search &&
!title.toLowerCase().includes(search) &&
!email.toLowerCase().includes(search)
){
return
}

container.innerHTML += `
<div class="bg-white p-4 rounded shadow flex items-center gap-4">

<img src="${claim.items?.image_url || ''}"
class="w-16 h-16 object-cover rounded">

<div class="flex-1">

<h3 class="font-semibold">${title}</h3>

<p class="text-sm text-gray-600">${email}</p>

<p class="text-xs text-gray-500">
Status: ${claim.status}
</p>

</div>

<div class="flex gap-3">

<button onclick="approveClaim('${claim.id}','${claim.item_id}')"
class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
Approve
</button>

<button onclick="rejectClaim('${claim.id}')"
class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
Reject
</button>

</div>

</div>
`

})

}


// =========================
// LOAD LOST ITEMS ADMIN
// =========================

async function loadLostItemsAdmin(){

const container=document.getElementById("lostAdmin")

if(!container) return

const search=document.getElementById("adminSearch")?.value.toLowerCase() || ""

const {data}=await supabaseClient
.from("items")
.select("*")
.eq("type","lost")
.eq("status","available")
.order("created_at",{ascending:false})

container.innerHTML=""

data.forEach(item=>{

if(search && !item.title.toLowerCase().includes(search)){
return
}

container.innerHTML += `
<div class="bg-white p-4 rounded shadow flex justify-between items-center">

<div class="pr-4">

<h3 class="font-semibold">${item.title}</h3>

<p class="text-sm text-gray-600">${item.description}</p>

</div>

<button onclick="resolveLostItem('${item.id}')"
class="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded w-40">
Mark Found
</button>

</div>
`

})

}


// =========================
// APPROVE CLAIM
// =========================

async function approveClaim(claimId,itemId){

await supabaseClient
.from("claims")
.update({status:"approved"})
.eq("id",claimId)

await supabaseClient
.from("claims")
.update({status:"rejected"})
.eq("item_id",itemId)
.neq("id",claimId)

await supabaseClient
.from("items")
.update({status:"claimed"})
.eq("id",itemId)

showToast("Claim approved")

loadClaims()
loadItems()

}


// =========================
// REJECT CLAIM
// =========================

async function rejectClaim(claimId){

await supabaseClient
.from("claims")
.update({status:"rejected"})
.eq("id",claimId)

loadClaims()

}


// =========================
// RESOLVE LOST ITEM
// =========================

async function resolveLostItem(itemId){

await supabaseClient
.from("items")
.update({status:"claimed"})
.eq("id",itemId)

showToast("Lost item marked as found")

loadLostItemsAdmin()

}


// =========================
// CHECK ADMIN
// =========================

async function checkAdmin(){

const {data:{user}}=await supabaseClient.auth.getUser()

if(!user){

window.location="index.html"

return

}

const {data:profile}=await supabaseClient
.from("profiles")
.select("role")
.eq("id",user.id)
.maybeSingle()

if(profile.role!=="admin"){

showToast("Access denied")

window.location="dashboard.html"

}

}


// Simple toast popup
function showToast(message, type = "success") {

const toast = document.getElementById("toast")

if(!toast) return

toast.textContent = message

// color
if(type === "error"){
toast.className = "fixed bottom-5 right-5 px-4 py-2 rounded text-white bg-red-500 opacity-100 transition-opacity duration-300 pointer-events-none"
}else{
toast.className = "fixed bottom-5 right-5 px-4 py-2 rounded text-white bg-green-500 opacity-100 transition-opacity duration-300 pointer-events-none"
}

// auto hide
setTimeout(()=>{
toast.style.opacity = "0"
},2000)

}

// AUTO LOAD ITEMS
loadItems()
