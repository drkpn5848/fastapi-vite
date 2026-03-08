import { useEffect, useRef, useState } from 'react';
import './App.css';
import Toast from './Toast';
import { APIURL, callApi, setSession, IMGURL } from './lib';
import Progress from './Progress';

const App = () => {
  const [tooglePassword, setTooglePassword] = useState("password");
  const [toogleConfirmPassword, setToogleConfirmPassword] = useState("password");
  const [activeWindow, setActiveWindow] = useState("signin")
  const [toast, setToast] = useState({type: "", message: "", id: 0});
  const [formData, setFormData] = useState({firstname: "",lastname: "", phone:"", emailid: "", password: "", cpassword: ""});
  const [errData, setErrorData] = useState({});
  const [isProgress, setIsProgress] = useState(false);

  const signinEmailRef = useRef(null);
  const signupFirstNameRef = useRef(null);

  useEffect(()=>{
    setSession("csrid", "", -1);
    if(activeWindow === "signin")
      signinEmailRef.current.focus();
    else
      signupFirstNameRef.current.focus();

  },[activeWindow]);

  function tooglePwd(){
    setTooglePassword(tooglePassword === "text" ? "password" : "text");
  }

  function toogleConfirmPwd(){
    setToogleConfirmPassword(toogleConfirmPassword === "text" ? "password" : "text");
  }

  function switchWindow(){
    setIsProgress(true);
    setErrorData({});
    setFormData({firstname: "",lastname: "", phone:"", emailid: "", password: "", cpassword: ""});
    setActiveWindow(activeWindow === "signin" ? "signup" : "signin")
    setIsProgress(false);
  }

  function validateSignin(){
    let errors = {};
    if(formData.emailid.trim() === "")
      errors.emailid = true;
    if(formData.password.trim() === "")
      errors.password = true;
    setErrorData(errors);
    return Object.keys(errors).length > 0;
  }

  function signin(){
    if(validateSignin())
      return;
    setIsProgress(true);
    let data = {emailid: formData.emailid, password: formData.password}
    callApi("POST", APIURL + "users/signin", JSON.stringify(data), signinResponse, errorHandler);
  }

  function signinResponse(res){
    setIsProgress(false);
    if(res.code === 401)
      setToast({ type: "error", message: res.msg, id: Date.now() });
    else{
      setSession("csrid", res.token, 1);
      window.location.replace("/home");
    }
  }

  function validate(){
    let errors = {};
    if (formData.firstname.trim() === "") errors.firstname = true;
    if (formData.lastname.trim() === "") errors.lastname = true;
    if (formData.phone.trim() === "") errors.phone = true;
    if (formData.emailid.trim() === "") errors.emailid = true;
    if (formData.password.trim() === "") errors.password = true;
    if (formData.cpassword.trim() === "") errors.cpassword = true;
    if(formData.password !== formData.cpassword)
    {
      errors.cpassword = true;
      setToast({ type: "error", message: "Password fields must match", id: Date.now() });
    }
    setErrorData(errors);
    return Object.keys(errors).length > 0;
  }

  function signup(){
    if(validate())
      return;
    setIsProgress(true);
    callApi("POST", APIURL + "users/signup", JSON.stringify(formData), signupResponse, errorHandler);
  }

  function signupResponse(res){
    setToast({ type: "success", message: res.msg, id: Date.now() });
    setIsProgress(false);
  }

  function errorHandler(err){
    setToast({ type: "error", message: err, id: Date.now() });
    setIsProgress(false);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  }

  return (
    <div className='app'>
      {activeWindow === "signin" && 
        <div className='signin-container'>
          <div className='logo-container'>
            <h2>Sign in</h2>
            <img className='logo' src={IMGURL + "logo.png"} alt='' />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "mail.png"} alt='' />
            <input type='text' autoComplete='off' ref={signinEmailRef} className={errData.emailid ? `error` : ``} placeholder='Email' name='emailid' value={formData.emailid} onChange={(e)=>handleInputChange(e)} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "lock.png"} alt='' />
            <input type={tooglePassword} autoComplete='off' className={errData.password ? `error` : ``} placeholder='Password' name='password' value={formData.password} onChange={(e)=>handleInputChange(e)} />
            <img className='right-icon' src={IMGURL + "eye.png"} alt='' onClick={()=>tooglePwd()} />
          </div>
          <div className='forgot-password'>Forgot <label onClick={()=>showSession()}>Password</label>?</div>
          <button onClick={() => signin()}>Get Started</button>
          <p>Don't have an account? <label onClick={()=>switchWindow()}>Sign up</label></p>
        </div>
      }
      {activeWindow === "signup" &&
        <div className='signup-container'>
          <div className='logo-container'>
            <h2>Create Account</h2>
            <img className='logo' src={IMGURL + "logo.png"} alt='' />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "user.png"} alt='' />
            <input type='text' autoComplete='off' ref={signupFirstNameRef} style={{'text-transform':'uppercase'}} className={errData.firstname ? `error` : ``} placeholder='First Name' name='firstname' value={formData.firstname} onChange={(e)=>handleInputChange(e)} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "user.png"} alt='' />
            <input type='text' autoComplete='off' style={{'text-transform':'uppercase'}} className={errData.lastname ? `error` : ``} placeholder='Last Name' name='lastname' value={formData.lastname} onChange={(e)=>handleInputChange(e)} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "phone.png"} alt='' />
            <input type='text' autoComplete='off' className={errData.phone ? `error` : ``} placeholder='Phone' name='phone' value={formData.phone} onChange={(e)=>handleInputChange(e)} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "mail.png"} alt='' />
            <input type='text' autoComplete='off' className={errData.emailid ? `error` : ``} placeholder='Email' name='emailid' value={formData.emailid} onChange={(e)=>handleInputChange(e)} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "lock.png"} alt='' />
            <input type={tooglePassword} autoComplete='off' className={errData.password ? `error` : ``} placeholder='Password' name='password' value={formData.password} onChange={(e)=>handleInputChange(e)} />
            <img className='right-icon' src={IMGURL + "eye.png"} alt='' onClick={()=>tooglePwd()} />
          </div>
          <div className='input-group'>
            <img className='left-icon' src={IMGURL + "lock.png"} alt='' />
            <input type={toogleConfirmPassword} autoComplete='off' className={errData.cpassword ? `error` : ``} placeholder='Confirm Password' name='cpassword' value={formData.cpassword} onChange={(e)=>handleInputChange(e)} />
            <img className='right-icon' src={IMGURL + "eye.png"} alt='' onClick={()=>toogleConfirmPwd()} />
          </div>
          <button onClick={()=>signup()}>Register</button>
          <p>Already have an account? <label onClick={()=>switchWindow()}>Sign in</label></p>
        </div>
      }

      <Progress isProgress={isProgress}/>
      <Toast toastData={toast} />
    </div>
  );
}

export default App;
