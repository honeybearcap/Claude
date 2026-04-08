const PASSAGES = [
  {
    title: "Rick the Lion Cub",
    bg: "bg-farm",
    emojis: ["🦁","🌿","🦄","✨","🌈","🐾"],
    text: "Rick was a cub. I like to roam said Rick. When the sun rose Rick ran in the grass. It is not time to roam said his mom. You are not grown yet. You must stay with the pride. Rick was mad. Do not moan said his mom. Us lions are so big we do not need to roam like the other animals. We can roar! OK mom said Rick. I will stay with the pride. I will roar! Rick could boast a low deep roar."
  },
  {
    title: "The Leaf Feast",
    bg: "bg-park",
    emojis: ["🦒","🌳","🦄","✨","🍃","🌈"],
    text: "I like to eat leaves. I run in the grass to find a tree. I reach up to the top. I take a bite. Munch! They are green and sweet. Yum! Yum! I let sis have a leaf feast. She can not reach to the top of the trees yet. Mom is glad that I share. It is time to take a nap. I dream of leaf cake. What do you like to feast on? I bet it is not as good as leaves!"
  },
  {
    title: "Toad and the Pond",
    bg: "bg-ocean",
    emojis: ["🐸","💧","🦄","✨","🌈","🪷"],
    text: "Toad sat on a log by the pond. He could hear the birds sing. A bee buzzed by his nose. Toad jumped into the pond with a big splash! The water was cool. He swam to a rock and sat in the sun. A fish came up and said hello. Toad smiled at the fish. This is the best day said Toad. He sang a little song. The frogs all joined in. They sang until the moon came up and the stars came out."
  },
  {
    title: "Nell the Brave Pup",
    bg: "bg-pets",
    emojis: ["🐶","🦴","🦄","✨","🌈","❤️"],
    text: "Nell was a small pup. She had soft brown fur. One day Nell saw a big cat in the yard. The cat hissed at her. Nell did not run. She stood tall and barked. The cat ran up a tree. Good job Nell said Mom. You are a brave pup! Nell wagged her tail fast. She was so proud. Dad gave her a treat. Nell ate it up and took a long nap in the sun. She dreamed of being the bravest dog in the land."
  },
  {
    title: "Bake Day with Gram",
    bg: "bg-garden",
    emojis: ["🧁","🍪","🦄","✨","🌈","💜"],
    text: "I like to bake with Gram. She has a big red bowl. We put in eggs and milk. We stir and stir. Gram lets me lick the spoon. Yum! We make little cakes with pink tops. I put them in a box. I take them to school. My pals all smile. These are so good they say. I tell them Gram and I made them. Gram says I am her best helper. Next time we will bake a big cake with sprinkles on top!"
  },
  {
    title: "The Lost Mitten",
    bg: "bg-winter",
    emojis: ["🧤","❄️","🦄","✨","🌈","⛄"],
    text: "It was cold and the snow fell fast. Kim put on her coat and hat. But she could not find her mitten! She looked under the bed. She looked in the box by the door. No mitten! Kim was sad. Then her cat came in with something red in his mouth. My mitten said Kim! The cat had found it under the couch. Thank you kitty said Kim. She gave the cat a hug. Then she ran outside to play in the snow at last."
  },
  {
    title: "Jake and the Big Wave",
    bg: "bg-ocean",
    emojis: ["🏄","🌊","🦄","✨","🌈","☀️"],
    text: "Jake went to the beach with his dad. The waves were big and blue. Jake was scared at first. You can do it said Dad. He held Jake's hand. A big wave came and splashed them both! Jake laughed and laughed. This is so much fun he said. They jumped in the waves all day long. Jake found a shell in the sand. It was pink and white. I will keep this shell to remember this day said Jake. It was the best trip ever."
  },
  {
    title: "The Little Seed",
    bg: "bg-rainbow",
    emojis: ["🌱","🌻","🦄","✨","🌈","💐"],
    text: "I found a little seed on the ground. It was so small. I dug a hole in the dirt and put it in. I gave it water each day. The sun helped it grow. First a tiny green stem popped up. Then came two little leaves. Each day it got taller. One morning I saw a big yellow flower on top! I was so happy. A bee came to visit my flower. Thank you for growing said the bee. I smiled and gave my flower more water."
  },
  {
    title: "The Fox and the Grapes",
    bg: "bg-park",
    emojis: ["🦊","🍇","🦄","✨","🌈","🌿"],
    text: "Fox was walking in the woods. He saw some grapes up high on a vine. Those grapes look so sweet said Fox. He jumped up to grab them. He missed! He tried again and again but he could not reach. A bird on a branch said why not ask for help? Fox did not think of that. Bird flew up and picked the grapes. They shared the grapes and sat in the shade. These are the best grapes ever said Fox. Thank you bird!"
  },
  {
    title: "My Pet Fish",
    bg: "bg-ocean",
    emojis: ["🐟","🐠","🦄","✨","🌈","💙"],
    text: "I have a pet fish. His name is Bubbles. He lives in a big glass tank in my room. Bubbles is orange and white. He swims around and around all day. I feed him each morning. He comes up to the top and eats his food fast. Sometimes he hides behind a little rock. I think he is playing a game. At night I turn off his light. Sleep well Bubbles I say. I am glad he is my pet. He makes me smile each day."
  },
  {
    title: "The Snow Fort",
    bg: "bg-winter",
    emojis: ["⛄","❄️","🦄","✨","🌈","🏔️"],
    text: "Ben and his sister Rose made a snow fort. They packed the snow into big blocks. The fort had two walls and a spot to hide. Let us have a snowball game said Ben. Rose made a pile of snowballs. Ben threw one and it hit the tree. Rose threw one and it hit Ben's hat! They both laughed so hard. Mom came out with hot cocoa for them. This is the best snow day ever said Rose. They drank their cocoa inside the fort."
  },
  {
    title: "The Kind Dragon",
    bg: "bg-space",
    emojis: ["🐉","🔥","🦄","✨","🌈","⭐"],
    text: "Once there was a dragon named Dot. She was green with little wings. The other animals were scared of her. But Dot was kind! One cold night the animals had no fire. Dot blew a tiny flame to keep them warm. Thank you Dot said the rabbit. You are not scary at all! Dot smiled a big smile. From that day on all the animals loved Dot. She would light the campfire each night. They would all sit together and tell stories under the stars."
  },
  {
    title: "The Bike Ride",
    bg: "bg-school",
    emojis: ["🚲","🛤️","🦄","✨","🌈","🌸"],
    text: "Dad got me a new bike. It was blue with a silver bell. I was scared to ride it at first. Dad held the back and ran with me. You can do it he said. I went faster and faster. Then Dad let go! I was riding all by myself! I rang the bell and laughed. I rode to the end of the street and back. Mom clapped for me. I am so proud of you she said. Now I ride my bike every single day after school."
  },
  {
    title: "Lunch with a Squirrel",
    bg: "bg-park",
    emojis: ["🐿️","🥜","🦄","✨","🌈","🌳"],
    text: "I sat on a bench to eat my lunch. A little squirrel came close. He looked at me with his big dark eyes. I think he wanted some of my food. I tossed him a bit of bread. He grabbed it with his tiny paws and ate it so fast! Then he came back for more. I gave him a piece of my apple. He liked that too. We ate lunch together every day that week. I named him Chip. Chip is my little park pal."
  },
  {
    title: "The Magic Box",
    bg: "bg-garden",
    emojis: ["📦","🪄","🦄","✨","🌈","💜"],
    text: "Gram gave me a box with a gold lid. What is inside I asked. You must guess said Gram. I shook it. Something moved inside! Is it a toy? No said Gram. Is it candy? No said Gram with a grin. I opened the lid and a little kitten popped out! She was gray with white paws. I love her I said. What will you name her asked Gram. I will call her Star because she is the best gift in the whole wide world!"
  },
  {
    title: "The Train Ride",
    bg: "bg-camping",
    emojis: ["🚂","🛤️","🦄","✨","🌈","🌟"],
    text: "Mom and I got on a big train. It went choo choo and started to move. I looked out the window. I saw green hills and red barns. I saw cows eating grass. A river went by so fast! The train man came and said tickets please. Mom gave him our tickets. He smiled at me and gave me a little hat. I put it on my head. I want to drive a train one day I said. Mom smiled. You can be whatever you want she said."
  },
  {
    title: "The Silly Monkey",
    bg: "bg-rainbow",
    emojis: ["🐒","🍌","🦄","✨","🌈","😄"],
    text: "We went to the zoo to see the animals. I liked the monkey best. He was brown and had a long tail. He swung from rope to rope so fast! Then he grabbed a banana and ate it in one big bite. He threw the peel on his friend's head! All the kids laughed so hard. The monkey clapped his hands like he was proud of his joke. I want to come back and see him again I told Mom. He is the funniest animal I have ever seen."
  },
  {
    title: "Camping Under Stars",
    bg: "bg-camping",
    emojis: ["⛺","🌙","🦄","✨","🌈","🔥"],
    text: "Dad and I went camping by the lake. We set up our tent under a big pine tree. I helped Dad make a fire. We roasted hot dogs on sticks. Then we made treats with crackers and chocolate. So yummy! When it got dark we lay on our backs and looked up. I could see so many stars. Dad showed me how to find the Big Dipper. That is so cool I said. An owl hooted in the trees. I fell asleep feeling happy and safe."
  },
  {
    title: "The Art Show",
    bg: "bg-school",
    emojis: ["🎨","🖌️","🦄","✨","🌈","🖼️"],
    text: "Today was the art show at school. I painted a picture of my family. I used red for Mom's dress and blue for Dad's hat. My little brother had a big grin on his face. My teacher hung it on the wall. Mom and Dad came to see it. That is beautiful said Mom. You are a real artist said Dad. I felt so proud inside. My friend Mia painted a rainbow with a unicorn. It was so pretty. I think I will paint a unicorn next time too!"
  },
  {
    title: "The Puppy Parade",
    bg: "bg-pets",
    emojis: ["🐕","🎀","🦄","✨","🌈","🐾"],
    text: "Our town had a puppy parade. Dogs of all sizes walked down the street. Some had little hats on. Some had bows and coats. One big dog had a cape like a superhero! My pup Daisy wore a pink tutu. She pranced and wagged her tail. All the people clapped and cheered. Daisy won a ribbon for cutest pup! I was so happy for her. We went home and I gave her a big bone. Good girl Daisy I said. You are a star!"
  }
];
