window.roundingGenerators = window.roundingGenerators || {};
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function choice(a){return a[randInt(0,a.length-1)];}
function fmtInt(n){return new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);}
function fmtScaled(n,d){var s=String(n).padStart(d+1,'0');return s.slice(0,-d)+','+s.slice(-d);}

window.roundingGenerators['rounding-decimal']=(function(){
 var decimals={tenths:1,hundredths:2,thousandths:3},names={tenths:'tiondel',hundredths:'hundradel',thousandths:'tusendel'};
 return {generate:function(p){var q=[],count=p.questionCount||15,d=p.decimalPlaces||4,scale=Math.pow(10,d),min=Math.ceil((p.min||0)*scale),max=Math.ceil((p.maxExclusive||100)*scale)-1,places=p.roundingPlaces||Object.keys(decimals);for(var i=0;i<count;i++){var scaled=randInt(min,max),place=choice(places),target=decimals[place],div=Math.pow(10,d-target),rounded=Math.round(scaled/div),answer=rounded/Math.pow(10,target),display=fmtScaled(scaled,d);q.push({number:scaled/scale,numberDisplay:display,place:place,placeName:names[place],text:'Avrunda '+display+' till närmaste '+names[place]+'.',answer:answer,answerDisplay:answer.toFixed(target).replace('.',',')});}return q;} };
})();
