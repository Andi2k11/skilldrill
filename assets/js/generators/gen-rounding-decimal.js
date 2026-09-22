window.roundingGenerators = window.roundingGenerators || {};
function randInt(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
function choice(a){return a[randInt(0,a.length-1)];}
function fmtInt(n){return new Intl.NumberFormat('sv-SE',{maximumFractionDigits:0}).format(n);}
function fmtScaled(n,d){var s=String(n).padStart(d+1,'0');return s.slice(0,-d)+','+s.slice(-d);}

window.roundingGenerators['rounding-decimal']=(function(){
 var decimals={ones:0,tenths:1,hundredths:2,thousandths:3},names={ones:'ental',tenths:'tiondel',hundredths:'hundradel',thousandths:'tusendel'};
 return {generate:function(p){
		var q=[];
		var count=p.questionCount||15;
		var d=p.decimalPlaces||4;
		var scale=Math.pow(10,d);
		var min=Math.ceil((p.min||0)*scale);
		var max=Math.ceil((p.maxExclusive||100)*scale)-1;
		var places=p.roundingPlaces||Object.keys(decimals);
		for(var i=0;i<count;i++){
			var scaled=randInt(min,max);
			var place=choice(places);
			var target=decimals[place];
			var div=Math.pow(10,d-target);
			var rounded=Math.round(scaled/div);
			var answer=rounded/Math.pow(10,target);
			var display=fmtScaled(scaled,d);
			q.push({number:scaled/scale,numberDisplay:display,place:place,placeName:names[place],text:'Avrunda '+display+' till närmaste '+names[place]+'.',answer:answer,answerDisplay:answer.toFixed(target).replace('.',',')});
		}
		return q;
	} };
})();
