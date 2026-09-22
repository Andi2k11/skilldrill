window.roundingGenerators = window.roundingGenerators || {};
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function choice(a){return a[randInt(0,a.length-1)];}
function fmtInt(n){return new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);}
function fmtScaled(n,d){var s=String(n).padStart(d+1,'0');return s.slice(0,-d)+','+s.slice(-d);}

window.roundingGenerators['rounding-integer']=(function(){
 var values={ones:1,tens:10,hundreds:100,thousands:1000};
 var names={ones:'ental',tens:'tiotal',hundreds:'hundratal',thousands:'tusental'};
 return {generate:function(p){var q=[],count=p.questionCount||15,places=p.roundingPlaces||Object.keys(values);for(var i=0;i<count;i++){var n=randInt(p.min||10000,p.max||99999),place=choice(places),answer=Math.round(n/values[place])*values[place],display=fmtInt(n);q.push({number:n,numberDisplay:display,place:place,placeName:names[place],text:'Avrunda '+display+' till närmaste '+names[place]+'.',answer:answer,answerDisplay:fmtInt(answer)});}return q;} };
})();
